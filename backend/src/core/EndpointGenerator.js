// src/core/EndpointGenerator.js
import express from 'express';
import db from '../config/database.js';
import analyzer from './CognitiveAnalyzer.js';

class EndpointGenerator {
    constructor() {
        this.router = express.Router();
        this.schema = null;
    }

    async initialize() {
        console.log('🧠 Inicializando generador inteligente...');
        
        // Analizar base de datos
        this.schema = await analyzer.analyze();
        
        console.log(`✅ Detectadas ${this.schema.total} tablas`);
        
        // Mostrar tablas faltantes
        if (Object.keys(this.schema.missing).length > 0) {
            console.log('⚠️ Tablas faltantes para apps:');
            for (const [app, info] of Object.entries(this.schema.missing)) {
                console.log(`   ${info.appName}: ${info.tables.join(', ')}`);
            }
        }

        // Generar endpoints
        await this.generateAllEndpoints();

        return this.router;
    }

    async generateAllEndpoints() {
        for (const [table, config] of Object.entries(this.schema.existing)) {
            this.generateTableEndpoints(table, config);
        }

        // Endpoint especial para descubrimiento
        this.router.get('/system/discover', (req, res) => {
            res.json({
                success: true,
                message: 'Arquitectura cognitiva detectada',
                data: {
                    tables: Object.values(this.schema.existing).map(t => ({
                        name: t.displayName,
                        domain: t.domainType,
                        icon: t.icon,
                        color: t.color,
                        endpoints: t.endpoints,
                        apps: t.apps
                    })),
                    missing: this.schema.missing,
                    apps: this.schema.apps
                }
            });
        });

        // Endpoint para generar SQL de tablas faltantes
        this.router.get('/system/generate-missing', (req, res) => {
            const { app } = req.query;
            if (app && this.schema.missing[app]) {
                res.json({
                    success: true,
                    sql: this.schema.missing[app].sql
                });
            } else {
                res.json({
                    success: true,
                    missing: this.schema.missing
                });
            }
        });
    }

    generateTableEndpoints(table, config) {
        const basePath = `/api/${table}`;

        // GET /api/tabla - Listar todos
        this.router.get(`/${table}`, async (req, res) => {
            try {
                const { page = 1, limit = 20, ...filters } = req.query;
                const offset = (page - 1) * limit;

                let query = `SELECT * FROM ${table}`;
                const values = [];

                // Aplicar filtros
                const whereClause = this.buildWhereClause(filters, config, values);
                if (whereClause) {
                    query += ` WHERE ${whereClause}`;
                }

                // Contar total
                const countQuery = `SELECT COUNT(*) as total FROM ${table}${whereClause ? ` WHERE ${whereClause}` : ''}`;
                const [countResult] = await db.query(countQuery, values);

                // Paginación
                query += ` LIMIT ? OFFSET ?`;
                values.push(parseInt(limit), parseInt(offset));

                // Ejecutar
                const [rows] = await db.query(query, values);

                // Parsear JSON si es necesario
                const parsedRows = config.hasJSON ? this.parseJSONFields(rows, config) : rows;

                res.json({
                    success: true,
                    data: parsedRows,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: countResult[0].total,
                        pages: Math.ceil(countResult[0].total / limit)
                    },
                    meta: {
                        table: table,
                        domain: config.domainType,
                        icon: config.icon,
                        color: config.color
                    }
                });

            } catch (error) {
                console.error(`Error en GET /${table}:`, error);
                res.status(500).json({
                    success: false,
                    message: error.message
                });
            }
        });

        // GET /api/tabla/:id - Obtener uno
        this.router.get(`/${table}/:id`, async (req, res) => {
            try {
                const [rows] = await db.query(
                    `SELECT * FROM ${table} WHERE ${config.primaryKey} = ?`,
                    [req.params.id]
                );

                if (rows.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Registro no encontrado'
                    });
                }

                const row = config.hasJSON ? this.parseJSONFields([rows[0]], config)[0] : rows[0];

                res.json({
                    success: true,
                    data: row
                });

            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message
                });
            }
        });

        // POST /api/tabla - Crear
        this.router.post(`/${table}`, async (req, res) => {
            try {
                const data = this.prepareDataForInsert(req.body, config);
                
                const [result] = await db.query(
                    `INSERT INTO ${table} SET ?`,
                    [data]
                );

                res.json({
                    success: true,
                    message: 'Registro creado exitosamente',
                    data: {
                        id: result.insertId,
                        ...data
                    }
                });

            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message
                });
            }
        });

        // PUT /api/tabla/:id - Actualizar
        this.router.put(`/${table}/:id`, async (req, res) => {
            try {
                const data = this.prepareDataForUpdate(req.body, config);
                
                const [result] = await db.query(
                    `UPDATE ${table} SET ? WHERE ${config.primaryKey} = ?`,
                    [data, req.params.id]
                );

                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Registro no encontrado'
                    });
                }

                res.json({
                    success: true,
                    message: 'Registro actualizado exitosamente'
                });

            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message
                });
            }
        });

        // DELETE /api/tabla/:id - Eliminar
        this.router.delete(`/${table}/:id`, async (req, res) => {
            try {
                const [result] = await db.query(
                    `DELETE FROM ${table} WHERE ${config.primaryKey} = ?`,
                    [req.params.id]
                );

                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Registro no encontrado'
                    });
                }

                res.json({
                    success: true,
                    message: 'Registro eliminado exitosamente'
                });

            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message
                });
            }
        });
    }

    buildWhereClause(filters, config, values) {
        const conditions = [];
        
        for (const [key, value] of Object.entries(filters)) {
            const column = config.columns.find(c => c.name === key);
            if (column) {
                if (value.includes(',')) {
                    // IN clause
                    const items = value.split(',');
                    conditions.push(`${key} IN (${items.map(() => '?').join(',')})`);
                    values.push(...items);
                } else if (value.includes('*')) {
                    // LIKE clause
                    conditions.push(`${key} LIKE ?`);
                    values.push(value.replace(/\*/g, '%'));
                } else {
                    conditions.push(`${key} = ?`);
                    values.push(value);
                }
            }
        }

        return conditions.join(' AND ');
    }

    parseJSONFields(rows, config) {
        const jsonColumns = config.columns.filter(c => c.type === 'json').map(c => c.name);
        
        return rows.map(row => {
            const parsed = { ...row };
            for (const col of jsonColumns) {
                if (row[col] && typeof row[col] === 'string') {
                    try {
                        parsed[col] = JSON.parse(row[col]);
                    } catch (e) {
                        // Si no es JSON válido, dejar como está
                    }
                }
            }
            return parsed;
        });
    }

    prepareDataForInsert(data, config) {
        const prepared = {};
        
        for (const column of config.columns) {
            if (column.autoIncrement) continue;
            
            if (data[column.name] !== undefined) {
                if (column.type === 'json' && typeof data[column.name] === 'object') {
                    prepared[column.name] = JSON.stringify(data[column.name]);
                } else {
                    prepared[column.name] = data[column.name];
                }
            }
        }

        return prepared;
    }

    prepareDataForUpdate(data, config) {
        const prepared = {};
        
        for (const column of config.columns) {
            if (column.primary) continue;
            
            if (data[column.name] !== undefined) {
                if (column.type === 'json' && typeof data[column.name] === 'object') {
                    prepared[column.name] = JSON.stringify(data[column.name]);
                } else {
                    prepared[column.name] = data[column.name];
                }
            }
        }

        return prepared;
    }
}

export default new EndpointGenerator();
