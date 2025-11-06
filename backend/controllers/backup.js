const { query } = require('../config/conexion');
const fs = require('fs');
const path = require('path');

// Función auxiliar para formatear tamaño de archivo
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Función auxiliar para guardar en historial
const guardarEnHistorial = async (backupRecord) => {
  try {
    const backupDir = path.join(__dirname, '../backups');
    const historyPath = path.join(backupDir, 'backup_history.json');
    let history = [];
    
    if (fs.existsSync(historyPath)) {
      const historyData = fs.readFileSync(historyPath, 'utf8');
      history = JSON.parse(historyData);
    }
    
    history.unshift(backupRecord);
    
    // Mantener solo los últimos 50 respaldos en el historial
    if (history.length > 50) {
      // Eliminar archivos físicos de respaldos antiguos
      const backupsToRemove = history.slice(50);
      for (const oldBackup of backupsToRemove) {
        if (fs.existsSync(oldBackup.path)) {
          try {
            fs.unlinkSync(oldBackup.path);
          } catch (error) {
            console.error('Error eliminando archivo antiguo:', error);
          }
        }
      }
      history = history.slice(0, 50);
    }
    
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error('Error guardando en historial:', error);
  }
};

// Función mejorada para obtener tablas
const obtenerTablas = async () => {
  try {
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    
    console.log('🔍 Ejecutando consulta para obtener tablas...');
    const result = await query(tablesQuery);
    
    console.log('📊 Resultado crudo de la consulta:', result);
    console.log('📝 Tipo de resultado:', typeof result);
    console.log('🔢 Es array?', Array.isArray(result));
    
    // Diferentes maneras de manejar el resultado según el driver de BD
    let tables = [];
    
    if (Array.isArray(result)) {
      tables = result;
    } else if (result && typeof result === 'object') {
      // Si es un objeto, intentar extraer las filas
      if (result.rows) {
        tables = result.rows;
      } else if (result[0] && result[0].table_name) {
        tables = result;
      } else {
        // Convertir objeto a array
        tables = Object.values(result);
      }
    } else if (result && result.constructor === Object) {
      tables = [result];
    }
    
    console.log(`✅ Se encontraron ${tables.length} tablas después del procesamiento`);
    
    // Filtrar solo objetos que tengan table_name
    tables = tables.filter(table => table && table.table_name);
    
    console.log(`📋 Tablas encontradas:`, tables.map(t => t.table_name));
    
    if (tables.length === 0) {
      throw new Error('No se encontraron tablas en la base de datos');
    }
    
    return tables;
    
  } catch (error) {
    console.error('❌ Error en obtenerTablas:', error);
    throw new Error(`Error al obtener tablas: ${error.message}`);
  }
};

// Crear respaldo de base de datos - VERSIÓN MEJORADA
const crearRespaldo = async (req, res) => {
  let backupContent = '';
  
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup_${timestamp}.sql`;
    const backupDir = path.join(__dirname, '../backups');
    const backupPath = path.join(backupDir, filename);

    // Crear directorio si no existe
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // 1. Obtener todas las tablas usando la función mejorada
    const tables = await obtenerTablas();
    
    backupContent += `-- Backup generado el: ${new Date().toISOString()}\n`;
    backupContent += `-- Base de datos: ${process.env.DB_NAME || 'Unknown'}\n`;
    backupContent += `-- Tablas respaldadas: ${tables.length}\n\n`;
    
    // 2. Generar SQL para cada tabla
    for (const table of tables) {
      const tableName = table.table_name;
      console.log(`🔄 Procesando tabla: ${tableName}`);
      
      try {
        // Obtener estructura de la tabla
        const structureQuery = `
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = $1
          ORDER BY ordinal_position
        `;
        
        const columnsResult = await query(structureQuery, [tableName]);
        let columns = [];
        
        // Manejar diferentes formatos de respuesta
        if (Array.isArray(columnsResult)) {
          columns = columnsResult;
        } else if (columnsResult && columnsResult.rows) {
          columns = columnsResult.rows;
        } else if (columnsResult && typeof columnsResult === 'object') {
          columns = Object.values(columnsResult);
        }
        
        // Crear CREATE TABLE statement
        backupContent += `-- Table: ${tableName}\n`;
        backupContent += `DROP TABLE IF EXISTS "${tableName}" CASCADE;\n\n`;
        backupContent += `CREATE TABLE "${tableName}" (\n`;
        
        const columnDefinitions = columns.map(col => {
          let definition = `  "${col.column_name}" ${col.data_type.toUpperCase()}`;
          
          // Agregar NOT NULL si aplica
          if (col.is_nullable === 'NO') {
            definition += ' NOT NULL';
          }
          
          // Agregar DEFAULT si existe
          if (col.column_default) {
            definition += ` DEFAULT ${col.column_default}`;
          }
          
          return definition;
        });
        
        backupContent += columnDefinitions.join(',\n');
        backupContent += '\n);\n\n';
        
        // Obtener datos de la tabla
        const dataQuery = `SELECT * FROM "${tableName}"`;
        const rowsResult = await query(dataQuery);
        let rows = [];
        
        // Manejar diferentes formatos de respuesta para datos
        if (Array.isArray(rowsResult)) {
          rows = rowsResult;
        } else if (rowsResult && rowsResult.rows) {
          rows = rowsResult.rows;
        } else if (rowsResult && typeof rowsResult === 'object') {
          rows = Object.values(rowsResult);
        }
        
        // Generar INSERT statements si hay datos
        if (rows.length > 0) {
          backupContent += `-- Data for ${tableName} (${rows.length} registros)\n`;
          
          for (const row of rows) {
            const columns = Object.keys(row);
            const values = columns.map(col => {
              const value = row[col];
              if (value === null || value === undefined) return 'NULL';
              if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
              if (value instanceof Date) return `'${value.toISOString()}'`;
              if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
              return value;
            });
            
            backupContent += `INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${values.join(', ')});\n`;
          }
          backupContent += '\n';
        } else {
          backupContent += `-- No hay datos en la tabla ${tableName}\n\n`;
        }
        
      } catch (tableError) {
        console.error(`❌ Error procesando tabla ${tableName}:`, tableError);
        backupContent += `-- ERROR procesando tabla ${tableName}: ${tableError.message}\n\n`;
      }
      
      backupContent += '\n';
    }

    // 3. Guardar archivo de respaldo
    fs.writeFileSync(backupPath, backupContent, 'utf8');
    
    // Verificar que el archivo se creó
    if (!fs.existsSync(backupPath)) {
      throw new Error('El archivo de respaldo no se creó');
    }

    const stats = fs.statSync(backupPath);
    const fileSize = stats.size;

    // Guardar en historial
    const backupRecord = {
      id: Date.now().toString(),
      filename,
      path: backupPath,
      size: fileSize,
      size_formatted: formatFileSize(fileSize),
      status: 'completed',
      created_at: new Date().toISOString(),
      database: process.env.DB_NAME || 'Unknown',
      tables_backed_up: tables.length
    };

    await guardarEnHistorial(backupRecord);

    console.log(`✅ Respaldo creado exitosamente: ${tables.length} tablas respaldadas`);
    
    res.json({
      success: true,
      message: `Respaldo creado exitosamente. ${tables.length} tablas respaldadas.`,
      data: backupRecord
    });

  } catch (err) {
    console.error('❌ Error en crearRespaldo:', err);
    res.status(500).json({ 
      success: false,
      message: `Error al crear respaldo: ${err.message}`,
      debug: process.env.NODE_ENV === 'development' ? {
        error: err.message,
        stack: err.stack
      } : undefined
    });
  }
};

// Las demás funciones permanecen igual...
const restaurarBaseDatos = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó archivo de respaldo'
      });
    }

    const file = req.file;
    const sqlContent = file.buffer.toString('utf8');

    // Dividir el SQL en statements individuales
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    let executedStatements = 0;
    let errors = [];

    // Ejecutar cada statement individualmente
    for (const statement of statements) {
      try {
        if (statement.startsWith('--') || statement.length === 0) {
          continue; // Saltar comentarios
        }
        
        await query(statement);
        executedStatements++;
        console.log(`✅ Statement ejecutado: ${statement.substring(0, 100)}...`);
      } catch (error) {
        console.error(`❌ Error ejecutando statement: ${statement.substring(0, 100)}...`, error);
        errors.push({
          statement: statement.substring(0, 200), // Solo primeros 200 chars
          error: error.message
        });
      }
    }

    // Registrar la restauración
    const restoreRecord = {
      id: Date.now().toString(),
      filename: file.originalname,
      restored_at: new Date().toISOString(),
      file_size: file.size,
      statements_executed: executedStatements,
      errors: errors.length > 0 ? errors : undefined
    };

    const restoreHistoryPath = path.join(__dirname, '../backups/restore_history.json');
    let restoreHistory = [];
    
    if (fs.existsSync(restoreHistoryPath)) {
      const historyData = fs.readFileSync(restoreHistoryPath, 'utf8');
      restoreHistory = JSON.parse(historyData);
    }
    
    restoreHistory.unshift(restoreRecord);
    fs.writeFileSync(restoreHistoryPath, JSON.stringify(restoreHistory, null, 2));

    const response = {
      success: true,
      message: `Base de datos restaurada exitosamente. ${executedStatements} statements ejecutados.`,
      data: restoreRecord
    };

    if (errors.length > 0) {
      response.warnings = `${errors.length} errores durante la restauración`;
      if (process.env.NODE_ENV === 'development') {
        response.errors = errors;
      }
    }

    res.json(response);

  } catch (err) {
    console.error('❌ Error en restaurarBaseDatos:', err);
    res.status(500).json({ 
      success: false,
      message: `Error al restaurar base de datos: ${err.message}`
    });
  }
};

const obtenerHistorialRespaldos = async (req, res) => {
  try {
    const backupDir = path.join(__dirname, '../backups');
    const historyPath = path.join(backupDir, 'backup_history.json');

    let history = [];
    
    if (fs.existsSync(historyPath)) {
      try {
        const historyData = fs.readFileSync(historyPath, 'utf8');
        history = JSON.parse(historyData);
      } catch (parseError) {
        console.error('Error parseando historial:', parseError);
        history = [];
      }
    }

    // Asegurarse de que history es un array
    if (!Array.isArray(history)) {
      history = [];
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedHistory = history.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedHistory,
      pagination: {
        page,
        limit,
        total: history.length,
        pages: Math.ceil(history.length / limit)
      }
    });
    
  } catch (err) {
    console.error('Error en obtenerHistorialRespaldos:', err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

const descargarUltimoRespaldo = async (req, res) => {
  try {
    const backupDir = path.join(__dirname, '../backups');
    const historyPath = path.join(backupDir, 'backup_history.json');

    if (!fs.existsSync(historyPath)) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron respaldos'
      });
    }

    const historyData = fs.readFileSync(historyPath, 'utf8');
    const history = JSON.parse(historyData);
    
    // Asegurarse de que history es un array
    if (!Array.isArray(history)) {
      return res.status(404).json({
        success: false,
        message: 'Historial de respaldos corrupto'
      });
    }
    
    const latestBackup = history.find(backup => backup.status === 'completed');

    if (!latestBackup) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron respaldos completados'
      });
    }

    const filePath = latestBackup.path;

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Archivo de respaldo no encontrado'
      });
    }

    res.setHeader('Content-Type', 'application/sql');
    res.setHeader('Content-Disposition', `attachment; filename="${latestBackup.filename}"`);
    res.setHeader('Content-Length', latestBackup.size);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
  } catch (err) {
    console.error('Error en descargarUltimoRespaldo:', err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

const eliminarRespaldo = async (req, res) => {
  try {
    const backupId = req.params.id;
    const backupDir = path.join(__dirname, '../backups');
    const historyPath = path.join(backupDir, 'backup_history.json');

    if (!fs.existsSync(historyPath)) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron respaldos'
      });
    }

    const historyData = fs.readFileSync(historyPath, 'utf8');
    let history = JSON.parse(historyData);
    
    // Asegurarse de que history es un array
    if (!Array.isArray(history)) {
      return res.status(404).json({
        success: false,
        message: 'Historial de respaldos corrupto'
      });
    }
    
    const backupIndex = history.findIndex(b => b.id === backupId);

    if (backupIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Respaldo no encontrado'
      });
    }

    const backup = history[backupIndex];

    // Eliminar archivo físico
    if (fs.existsSync(backup.path)) {
      fs.unlinkSync(backup.path);
    }

    // Eliminar del historial
    history.splice(backupIndex, 1);
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));

    res.json({
      success: true,
      message: 'Respaldo eliminado exitosamente'
    });
    
  } catch (err) {
    console.error('Error en eliminarRespaldo:', err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

module.exports = {
  crearRespaldo,
  restaurarBaseDatos,
  descargarUltimoRespaldo,
  obtenerHistorialRespaldos,
  eliminarRespaldo
};