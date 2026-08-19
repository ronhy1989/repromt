// ============================================
// REPROMPT INTELLIGENCE - VERSION 36.0.0 "INTELIGENCIA TOTAL - 18 SISTEMAS"
// CON BACKOFF EXPONENCIAL PARA 429 Y VOCABULARIO COMPLETO
// ============================================

class RepromptIntelligence {
    constructor() {
        this.version = "36.0.0";
        
        // ==================== CONFIGURACIÓN GEMINI API ====================
        this.gemini = {
            apiKey: "AIzaSyAE866guB-zbjsrOmJ3Lk8a8vrD3P3kWCo",
            baseUrl: "https://generativelanguage.googleapis.com/v1beta",
            model: "gemini-1.5-flash",
            temperature: 0.8,
            maxTokens: 1000,
            timeout: 10000,
            disponible: false,
            reintentos: 0,
            maxReintentos: 3,
            tiempoEsperaBase: 5000
        };
        
        this.openai = { disponible: false };
        
        // ==================== MEMORIA Y APRENDIZAJE ====================
        this.memoria = {
            conversaciones: [],
            respuestasExitosas: [],
            respuestasFallidas: [],
            reflexionesProfundas: [],
            momentosClave: [],
            preguntasRealizadas: new Set(),
            fechaUltimaPregunta: null,
            ultimaPreguntaActiva: null,
            ultimoTema: null,
            informacionUsuario: {
                nombre: null,
                edad: null,
                ocupacion: null,
                hobbies: [],
                motivaciones: [],
                miedos: [],
                fortalezas: []
            },
            perfilPsicologico: {
                personalidad: null,
                inteligenciaEmocional: null,
                estiloAprendizaje: null,
                fortalezas: [],
                mindset: null,
                proposito: null
            },
            patrones: {
                temasFavoritos: {},
                emocionesComunes: {},
                palabrasClave: {},
                mejoresRespuestas: new Map(),
                estadoEmocional: {
                    ultimo: null,
                    historial: [],
                    tendencia: "estable",
                    patronesDiarios: {}
                }
            },
            evolucion: {
                generacion: 1,
                nivelSabiduria: 1,
                totalInteracciones: 0,
                feedbackPositivo: 0,
                feedbackNegativo: 0,
                metasPropuestas: 0,
                habitosSugeridos: 0,
                reflexionesGeneradas: 0,
                momentosInspiracion: 0,
                xpTotal: 84,
                nivelActual: 1,
                nivelMaximoAlcanzado: 1,
                desbloqueos: {
                    nivel2: false, nivel3: false, nivel4: false, nivel5: false
                },
                hitos: {
                    primeras5Interacciones: true,
                    primeras20Interacciones: false,
                    primeras50Interacciones: false,
                    primeras100Interacciones: false,
                    primeraMetaCompletada: false,
                    primerHabitoMantenido: false,
                    racha7Dias: false,
                    racha30Dias: false,
                    feedbackPositivo10: false,
                    feedbackPositivo50: false
                }
            }
        };
        
        // ==================== DATOS DEL USUARIO ====================
        this.usuario = {
            nombre: "Usuario",
            nivel: 1,
            xp: 84,
            racha: 0,
            emocionPredominante: "neutral",
            arquetipo: "buscador",
            valores: [],
            proposito: null,
            id: "user_" + Date.now(),
            patronesPersonales: {
                mejorMomento: "mañana",
                temasPreferidos: [],
                palabrasComunes: {}
            },
            estadisticas: {
                metasCompletadasHistorial: 0,
                habitosMantenidos: 0,
                diasConsecutivos: 0,
                reflexionesCompletadas: 0,
                nivelAlcanzado: 1
            }
        };
        
        // ==================== DATOS DE REPROMPT OS ====================
        this.datos = {
            metas: { activas: [], completadas: 0, total: 0, progresoPromedio: 0, lista: [] },
            habitos: { activos: [], rachaTotal: 0, mejorRacha: 0, lista: [] },
            ejercicios: { caloriasHoy: 0, racha: 0, minutosActivos: 0, total: 0 },
            sueno: { horasAnoche: 0, calidad: 0, racha: 0, promedioSemana: 0 },
            logros: { total: 0, recientes: [], nivelLogros: 1 },
            dashboard: { totalEntradas: 0, nivel: 1, racha: 0 },
            emocional: { ultimaEmocion: null, resumen: {}, historial: [] },
            profesionales: { conectados: 0, proximasCitas: 0 },
            musica: { generoFavorito: null, cancionesFavoritas: 0, playlistActivas: 0, ultimaEscuchada: null },
            comunidad: { misPublicaciones: 0, interaccions: 0, seguidores: 0 },
            crisis: { recursosGuardados: 0, planSeguridad: false, ultimoRegistro: null },
            cuestionarios: { totalRealizados: 0, promedioGeneral: 0, resultados: {}, ultimoResultado: null },
            biblioteca: { totalLibros: 0, leidos: 0, favoritos: 0, ultimoAgregado: null },
            reportes: { ultimoReporte: null, estadisticasSemanales: {} },
            mapas: { total: 0, ultimoCreado: null, favoritos: 0 },
            database: { ultimaSincronizacion: null, datosSincronizados: 0 },
            plugins: { instalados: 0, activos: 0, lista: [] },
            libroVida: { totalEntradas: 0, porTipo: { texto: 0, audio: 0, video: 0, conversacion: 0 }, ultimaEntrada: null }
        };
        
        // ==================== VOCABULARIO COMPLETO POR INTENCIÓN ====================
        this.vocabularioIntenciones = {
            consultar_metas: {
                palabras: ["mis metas", "revisa metas", "cómo van mis metas", "qué metas tengo", "ver metas", "estado de metas", "progreso de metas", "metas actuales", "dime mis metas", "mostrar metas", "lista de metas", "avance de metas", "revisar objetivos", "qué objetivos tengo", "mis propósitos", "qué quiero lograr", "mis proyectos personales", "en qué voy con mis metas", "cuántas metas he completado", "metas pendientes", "metas en progreso", "metas finalizadas", "objetivo principal", "meta del mes", "meta de la semana", "qué me propuse lograr", "cuál es mi norte", "qué estoy construyendo", "mis sueños en proceso", "qué quiero alcanzar", "hacia dónde voy"],
                peso: 10
            },
            crear_meta: {
                palabras: ["crear meta", "nueva meta", "agregar meta", "quiero lograr", "establecer meta", "añadir objetivo", "proponerme", "definir meta", "registrar meta", "guardar meta", "iniciar meta", "empezar meta", "quiero conseguir", "mi meta es", "añadir propósito", "crear propósito", "definir objetivo", "quiero completar", "agregar proyecto", "nuevo propósito", "quiero alcanzar", "deseo lograr", "aspiro a", "me propongo", "voy a lograr", "quiero terminar", "mi objetivo es", "quiero cumplir", "añadir a mis metas", "registrar nuevo objetivo"],
                peso: 9
            },
            actualizar_meta: {
                palabras: ["actualizar meta", "avancé en mi meta", "progreso de meta", "completé mi meta", "terminé mi meta", "logré mi meta", "avance porcentaje", "subir progreso", "aumentar progreso", "voy en porcentaje", "llevo porcentaje", "meta va en porcentaje", "progreso actual", "actualizar avance", "adelanté en mi objetivo", "mejoré en mi meta", "cumplí parcialmente", "estoy a tanto porciento", "mi meta está a tanto", "completé una parte", "terminé una fase", "logré un hito", "superé un paso", "alcancé un avance", "ya casi cumplo", "estoy cerca de lograrlo", "avance significativo", "marcar como completada", "celebrar logro"],
                peso: 9
            },
            consultar_progreso: {
                palabras: ["mi progreso", "cómo voy", "qué he logrado", "estadísticas generales", "mi avance", "mi nivel", "cuánta XP tengo", "mi racha", "resumen de progreso", "estado general", "panorama general", "cómo estoy progresando", "qué he conseguido", "cuánto he avanzado", "mi evolución", "mi crecimiento", "mis logros acumulados", "mi desempeño", "mi trayectoria", "qué tanto he mejorado", "mi desarrollo personal", "qué resultados tengo"],
                peso: 8
            },
            consultar_habitos: {
                palabras: ["mis hábitos", "qué hábitos tengo", "revisar hábitos", "lista de hábitos", "estado de hábitos", "racha de hábitos", "hábitos activos", "rutinas diarias", "qué debo hacer hoy", "mis costumbres", "hábitos que estoy construyendo", "qué repito cada día", "mis disciplinas", "compromisos diarios", "rutinas matutinas", "rutinas nocturnas", "hábitos saludables", "qué hago regularmente", "mi consistencia", "mi constancia", "qué estoy practicando"],
                peso: 7
            },
            crear_habito: {
                palabras: ["crear hábito", "nuevo hábito", "agregar hábito", "quiero construir el hábito de", "establecer rutina", "empezar hábito", "registrar hábito", "añadir costumbre", "quiero hacer cada día", "voy a repetir", "disciplina nueva", "rutina nueva", "hábito diario", "hábito semanal", "quiero mantener", "quiero consistencia"],
                peso: 8
            },
            completar_habito: {
                palabras: ["completar hábito", "hice mi hábito", "cumplí con mi hábito", "marcar hábito como hecho", "hoy hice", "ya lo hice", "registra que completé", "terminé mi hábito", "realicé mi rutina", "cumplí hoy", "mi racha sigue", "día completado", "hecho por hoy", "ya cumplí con", "tachar hábito", "confirmar realización"],
                peso: 8
            },
            racha_habitos: {
                palabras: ["racha de hábitos", "cuántos días seguidos", "mi racha actual", "racha más larga", "días consecutivos", "consistencia acumulada", "qué racha tengo", "no he fallado", "días seguidos haciendo", "mi mejor marca"],
                peso: 6
            },
            registrar_ejercicio: {
                palabras: ["registrar ejercicio", "hice ejercicio", "entrené hoy", "actividad física", "cuánto entrené", "minutos de ejercicio", "calorías quemadas", "mi rutina de hoy", "qué deporte hice", "mi entrenamiento", "sesión de hoy", "ejercicio completado", "corrí", "troté", "caminé", "cardio", "pesas", "gimnasio", "yoga", "pilates", "natación", "nadé", "bicicleta", "bici", "spinning", "crossfit", "funcional", "estiramientos", "movilidad", "baile", "dancing", "senderismo", "trekking", "escalada", "calistenia", "abdominales", "flexiones", "sentadillas", "dominadas", "plancha", "burpees", "saltar la cuerda", "zumba", "artes marciales", "boxeo", "kickboxing", "taekwondo", "karate"],
                peso: 8
            },
            consultar_ejercicios: {
                palabras: ["mis ejercicios", "cuánto he entrenado", "estadísticas de ejercicio", "resumen de actividad física", "calorías quemadas totales", "minutos activos totales", "días de entrenamiento", "frecuencia semanal", "mejor marca", "récord personal", "progreso físico"],
                peso: 6
            },
            registrar_sueno: {
                palabras: ["registrar sueño", "dormí horas", "anoche dormí", "mi sueño de anoche", "calidad de sueño", "descansé horas", "mis horas de sueño", "cómo dormí", "cómo descansé", "calidad del descanso", "sueño reparador", "cuánto dormí", "mi descanso nocturno", "horas en cama", "sueño profundo", "me desperté", "me costó dormir", "me levanté cansado", "descansé bien", "descansé mal"],
                peso: 8
            },
            consultar_sueno: {
                palabras: ["mi sueño", "cómo he dormido", "estadísticas de sueño", "promedio de horas", "calidad de sueño promedio", "historial de descanso", "resumen de sueño", "patrón de sueño", "regularidad", "informe de descanso", "calidad promedio", "tendencia de sueño"],
                peso: 6
            },
            reproducir_musica: {
                palabras: ["pon música", "reproduce música", "quiero escuchar", "activa música", "enciende música", "poner canción", "reproducir canción", "escuchar audio", "iniciar música", "comenzar música", "que suene música", "quiero audio", "pon algo de música", "necesito música", "quiero fondo musical", "música para concentrarme", "música de estudio", "música para trabajar", "música clásica", "lofi", "música de oficina", "música para leer", "música para programar", "sonidos de enfoque", "música productiva", "música para dormir", "música relajante", "sonido de lluvia", "ruido blanco", "música de sueño", "melodía para descansar", "frecuencias para dormir", "música nocturna", "sonidos de naturaleza", "música para meditar", "sonidos de meditación", "música zen", "música de calma", "melodía mindfulness", "sonidos de paz", "música espiritual", "frecuencias de sanación", "música motivacional", "música alegre", "música feliz", "música para entrenar", "música con energía", "rock motivador", "música positiva", "canciones que animen"],
                peso: 7
            },
            control_musica: {
                palabras: ["sube volumen", "baja volumen", "volumen al", "silencio", "mute", "pausa", "para la música", "siguiente canción", "canción anterior", "repetir", "en bucle", "aleatorio", "modo aleatorio", "playlist", "mi lista de reproducción", "canciones favoritas", "guardar en favoritos"],
                peso: 7
            },
            consultar_biblioteca: {
                palabras: ["mis libros", "qué libros tengo", "biblioteca personal", "libros leídos", "libros por leer", "libros favoritos", "cuántos libros he leído", "lista de pendientes", "próximo a leer", "libro que me cambió", "mi libro favorito", "mejor libro que he leído"],
                peso: 6
            },
            agregar_libro: {
                palabras: ["agregar libro", "nuevo libro", "añadir a biblioteca", "quiero leer", "estoy leyendo", "terminé de leer", "libro terminado", "libro completado"],
                peso: 7
            },
            recomendar_libro: {
                palabras: ["recomendar libro", "qué libro me recomiendas", "recomiéndame algo", "libro sobre motivación", "libro de desarrollo personal", "biografía", "ficción", "no ficción", "ensayo", "poesía", "filosofía", "psicología", "negocios", "finanzas"],
                peso: 5
            },
            escuchar_audiolibro: {
                palabras: ["escuchar audiolibro", "reproducir audiolibro", "quiero oír un libro", "pon el audiolibro", "audiolibro de", "narración", "versión audio", "libro hablado"],
                peso: 7
            },
            consultar_logros: {
                palabras: ["mis logros", "qué medallas tengo", "trofeos obtenidos", "recompensas conseguidas", "qué he desbloqueado", "mis reconocimientos", "logros conseguidos", "insignias obtenidas", "premios ganados", "medallas desbloqueadas", "qué he ganado", "mis trofeos", "colección de logros", "qué he completado", "medalla de oro", "medalla de plata", "medalla de bronce", "insignia especial", "logro secreto", "logro de nivel", "racha conseguida", "desafío completado", "misión terminada", "reto superado"],
                peso: 6
            },
            consultar_comunidad: {
                palabras: ["comunidad", "otros usuarios", "publicaciones", "mi red", "seguidores", "siguiendo", "qué dijo la comunidad", "publicaciones recientes", "mi muro", "notificaciones", "mensajes", "conversaciones", "grupo de apoyo", "retos grupales", "competencia amistosa"],
                peso: 5
            },
            publicar_comunidad: {
                palabras: ["publicar", "compartir", "escribir en comunidad", "compartir mi progreso", "contar mi logro", "pedir consejo", "ayudar a alguien", "comentar", "reaccionar", "dar like", "apoyar", "motivar a otros", "celebrar con otros"],
                peso: 6
            },
            crisis_ayuda: {
                palabras: ["crisis", "emergencia", "no estoy bien", "necesito ayuda", "ayuda urgente", "momento difícil", "estoy mal", "me siento abrumado", "no puedo más", "necesito apoyo", "suicidio", "quiero morir", "no quiero vivir", "daño", "lastimarme", "peligro", "desesperado", "sin salida", "no aguanto", "colapsando", "crisis nerviosa", "ataque de pánico", "ansiedad extrema", "depresión profunda"],
                peso: 10
            },
            plan_seguridad: {
                palabras: ["plan de seguridad", "recursos de emergencia", "líneas de ayuda", "contacto de emergencia", "profesionales disponibles", "ayuda profesional", "terapia", "psicólogo", "psiquiatra", "línea de prevención", "chat de ayuda", "recursos guardados", "ejercicios de respiración", "técnicas de anclaje"],
                peso: 9
            },
            consultar_cuestionarios: {
                palabras: ["cuestionarios", "tests", "evaluaciones", "test de personalidad", "big five", "cinco grandes", "test de inteligencia emocional", "IE", "test de fortalezas", "test de aprendizaje", "test de mindset", "test de propósito", "cuestionario de hábitos", "evaluación de bienestar", "ver resultados", "interpretación de resultados", "historial de tests", "comparar resultados", "evolución en el tiempo"],
                peso: 6
            },
            realizar_cuestionario: {
                palabras: ["responder preguntas", "hacer el test de", "empezar cuestionario", "continuar test", "siguiente pregunta", "responder con"],
                peso: 7
            },
            consultar_mapas: {
                palabras: ["mapa mental", "mapa conceptual", "ver mis mapas", "mapa más reciente", "mapa favorito", "mapa compartido", "mapa en progreso", "borrador de mapa"],
                peso: 5
            },
            crear_mapa: {
                palabras: ["crear mapa", "visualizar ideas", "organizar pensamientos", "conexiones entre ideas", "estructura de pensamiento", "diagrama de ideas", "mi mapa", "mis mapas", "mapa de metas", "mapa de proyecto", "mapa de aprendizaje", "agregar nodo", "conectar ideas", "editar mapa", "compartir mapa", "exportar mapa", "mapa interactivo", "vista gráfica", "reorganizar", "colapsar ramas", "expandir todo"],
                peso: 6
            },
            gestionar_plugins: {
                palabras: ["plugins", "tienda", "instalar", "desinstalar", "comprar", "demo", "probar plugin", "extensiones", "complementos", "funcionalidades extra", "qué plugins hay", "plugins disponibles", "plugins instalados", "plugins activos", "licencia activa", "demo activa", "prueba gratuita"],
                peso: 5
            },
            generar_reporte: {
                palabras: ["reportes", "informes", "resumen semanal", "resumen mensual", "estadísticas detalladas", "mi evolución", "gráficos de progreso", "análisis de datos", "tendencias", "patrones de comportamiento", "informe de productividad", "reporte de hábitos", "generar reporte", "exportar reporte", "descargar como PDF", "enviar por correo", "compartir reporte", "ver tendencias", "ver gráficos", "comparar períodos"],
                peso: 5
            },
            respaldo_datos: {
                palabras: ["respaldo", "sincronización", "guardar datos", "exportar información", "copia de seguridad", "restaurar datos", "migrar información", "recuperar cuenta", "perder datos", "recuperar progreso", "hacer respaldo", "exportar todo", "guardar copia", "sincronizar ahora", "restaurar desde copia", "recuperar datos perdidos", "migrar a otro dispositivo", "vincular cuenta", "iniciar sesión", "cerrar sesión", "última sincronización", "tamaño del respaldo", "fecha del último guardado", "dispositivos vinculados", "almacenamiento usado"],
                peso: 5
            },
            ver_dashboard: {
                palabras: ["panel principal", "inicio", "vista general", "resumen rápido", "qué hay de nuevo", "mi espacio", "página principal", "ver todo de un vistazo", "panorama general", "estado actual", "ir al inicio", "mostrar panel", "ver resumen", "mi día hoy", "qué me espera", "estado general", "qué falta por hacer", "vista rápida", "tarjetas de progreso"],
                peso: 6
            },
            bienestar_emocional: {
                palabras: ["bienestar emocional", "salud mental", "estado de ánimo", "regulación emocional", "inteligencia emocional", "manejo de emociones", "cómo gestionar mis sentimientos", "registrar emoción", "cómo me siento", "mi estado emocional hoy", "tracking de ánimo", "diario emocional", "qué siento ahora", "identificar emoción", "validar sentimiento", "aceptar lo que siento"],
                peso: 7
            },
            emociones_especificas: {
                palabras: ["alegría", "felicidad", "tristeza", "enojo", "ira", "frustración", "ansiedad", "nerviosismo", "miedo", "terror", "calma", "tranquilidad", "paz", "serenidad", "motivación", "entusiasmo", "aburrimiento", "apatía", "gratitud", "aprecio", "amor", "cariño", "soledad", "vacío", "esperanza", "optimismo", "pesimismo", "confianza", "inseguridad", "orgullo", "vergüenza", "culpa", "remordimiento"],
                peso: 7
            },
            consultar_perfil: {
                palabras: ["mi perfil", "quién soy", "mis datos", "información personal", "editar perfil", "cambiar nombre", "mi arquetipo", "personalidad", "fortalezas", "valores", "propósito de vida", "quién soy según REPROMPT", "describe mi perfil", "cuál es mi propósito", "cuáles son mis valores", "qué me define", "mi identidad", "mi esencia"],
                peso: 6
            },
            actualizar_perfil: {
                palabras: ["editar perfil", "cambiar mi", "actualizar mi información", "mi edad es", "mi ocupación es", "vivo en", "mi hobby es", "me apasiona", "mi mayor fortaleza es", "mi miedo es", "mi sueño es"],
                peso: 7
            },
            aprendizaje_ia: {
                palabras: ["aprendizaje", "autoaprendizaje", "qué has aprendido de mí", "cómo funciona tu inteligencia", "cómo aprendes", "palabras nuevas", "código nuevo", "programación", "enseñarme algo", "quiero aprender sobre", "qué sabes de mí", "qué recuerdas", "qué has guardado sobre mí", "qué palabras has aprendido", "qué código has memorizado", "evalúa mi progreso", "retroalimentación de mi aprendizaje"],
                peso: 5
            },
            programacion: {
                palabras: ["java", "javascript", "python", "html", "css", "sql", "c++", "c#", "ruby", "go", "rust", "swift", "kotlin", "php", "typescript", "variables", "funciones", "condicionales", "bucles", "arrays", "objetos", "clases", "herencia", "métodos", "librerías", "apis", "frameworks", "sintaxis", "ejemplos", "tutoriales", "ejercicios"],
                peso: 6
            },
            preguntar_nombre: {
                palabras: ["cómo me llamo", "sabes mi nombre", "cuál es mi nombre", "dime mi nombre", "recuerdas mi nombre"],
                peso: 9
            },
            decir_nombre: {
                palabras: ["mi nombre es", "me llamo", "soy", "puedes llamarme"],
                peso: 9
            },
            ayuda: {
                palabras: ["qué puedes hacer", "cómo funcionas", "qué comandos tienes", "ayuda", "qué puedo preguntarte", "cómo usarte", "explicación", "tutorial", "guía", "qué sabes hacer", "cuáles son tus funciones", "qué te puedo pedir", "dime tus capacidades", "cómo interactúo contigo"],
                peso: 8
            },
            saludo: {
                palabras: ["hola", "buenos días", "buenas tardes", "buenas noches", "hey", "qué tal", "saludos"],
                peso: 5
            },
            agradecimiento: {
                palabras: ["gracias", "muchas gracias", "te agradezco", "gracias por todo", "muy bien", "excelente", "perfecto", "genial", "fantástico"],
                peso: 5
            }
        };
        
        // ==================== PREGUNTAS PROACTIVAS ====================
        this.preguntasProactivas = {
            basico: [
                "¿Qué es lo que más te apasiona en la vida?",
                "¿Cuál es tu mayor fortaleza?",
                "¿Qué habilidad te gustaría desarrollar?",
                "¿Qué te motiva a levantarte cada día?",
                "¿Qué significa para ti el éxito?"
            ],
            profundo: [
                "¿Qué miedo te gustaría superar?",
                "¿Qué cambiarías de tu vida si pudieras?",
                "¿Cuándo fue la última vez que te sentiste realmente vivo?",
                "¿Qué persona ha influido más en tu vida?",
                "¿Qué te gustaría que recordaran de ti?"
            ],
            contexto: [
                "¿Cómo es un día típico en tu vida?",
                "¿Qué te ayuda a recargar energías?",
                "¿Qué te causa más estrés actualmente?",
                "¿Qué te hace sentir agradecido?",
                "¿Qué sueño te gustaría cumplir este año?"
            ]
        };
        
        // ==================== ORGANIZACIÓN DIARIA ====================
        this.organizacion = {
            hoy: {
                fecha: null,
                intencion: null,
                prioridades: [],
                completadas: [],
                aprendizaje: null,
                gratitud: null,
                energia: 0,
                estadoAnimo: null,
                reflexionDelDia: null
            }
        };
        
        // ==================== PREGUNTAS POR NIVEL ====================
        this.preguntasPorNivel = {
            nivel1: { nombre: "Aprendiz", xpRequerido: 0 },
            nivel2: { nombre: "Explorador", xpRequerido: 100 },
            nivel3: { nombre: "Buscador", xpRequerido: 300 },
            nivel4: { nombre: "Sabio", xpRequerido: 600 },
            nivel5: { nombre: "Maestro", xpRequerido: 1000 }
        };
        
        // ==================== BASE DE CONOCIMIENTO ====================
        this.preguntasFilosoficas = {
            existencia: [
                "🌌 ¿Cuál es el propósito de tu existencia en este momento?",
                "🌀 ¿Qué huella quieres dejar en el mundo?",
                "🌟 ¿Qué significa para ti vivir una vida plena?"
            ],
            conciencia: [
                "🧠 ¿Quién eres realmente más allá de tu nombre?",
                "🔍 ¿Qué parte de ti no conoces todavía?"
            ],
            libertad: [
                "🕊️ ¿Qué te ata y qué te libera?",
                "🔓 ¿Qué creencias limitantes te gustaría soltar?"
            ],
            felicidad: [
                "😊 ¿Qué es la felicidad para ti?",
                "💖 ¿Cuándo fue la última vez que te sentiste plenamente feliz?"
            ]
        };
        
        this.pensamientosSabios = [
            "🏛️ Marco Aurelio: 'Tienes poder sobre tu mente, no sobre los eventos.'",
            "🎭 Séneca: 'No sufrimos por lo que nos pasa, sino por cómo interpretamos lo que nos pasa.'",
            "🍃 Buda: 'La mente lo es todo. En lo que piensas, te conviertes.'",
            "🌙 Lao Tsé: 'Un viaje de mil millas comienza con un solo paso.'"
        ];
        
        this.frasesMotivacion = [
            "🚀 Tu único límite es el que te pones.",
            "💪 El fracaso no es caer, es no levantarse.",
            "🌟 Lo que sembrarás hoy, cosecharás mañana.",
            "✨ Cree en ti, aunque nadie más lo haga."
        ];
        
        this.metáforas = [
            "🌱 Eres como una semilla: dentro de ti está el árbol que puedes llegar a ser.",
            "🌊 Eres como el océano: calmo en la superficie, profundo en el interior."
        ];
        
        this.afirmaciones = [
            "💪 Soy capaz de lograr lo que me propongo.",
            "✨ Merezco amor, respeto y felicidad.",
            "🌟 Cada día soy una mejor versión de mí."
        ];
        
        this.preguntasCoaching = {
            vision: ["🎯 ¿Dónde te ves en 5 años?", "🏔️ ¿Qué montaña quieres conquistar?"],
            valores: ["💎 ¿Qué valores guían tu vida?", "⚖️ ¿Qué es innegociable para ti?"]
        };
        
        // ==================== SISTEMA DE AUTO-APRENDIZAJE ====================
        this.aprendizaje = {
            vocabulario: { palabras: {}, frasesHechas: [], patrones: [] },
            codigo: { lenguajes: {}, snippets: [] },
            memoria: { aciertos: 0, errores: 0, ultimoFeedback: null, temasAprendidos: [], preguntasRespondidas: [] },
            programacion: {
                java: {
                    sintaxis: { holaMundo: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hola Mundo");\n    }\n}', variables: 'int numero = 10;\nString texto = "Hola";' },
                    condicionales: { if: 'if (condicion) {\n    // código\n} else {\n    // código\n}' },
                    bucles: { for: 'for (int i = 0; i < 10; i++) {\n    System.out.println(i);\n}', while: 'while (condicion) {\n    // código\n}' }
                },
                javascript: {
                    sintaxis: { holaMundo: 'console.log("Hola Mundo");', variables: 'let numero = 10;\nconst texto = "Hola";' },
                    condicionales: { if: 'if (condicion) {\n    // código\n} else {\n    // código\n}' },
                    bucles: { for: 'for (let i = 0; i < 10; i++) {\n    console.log(i);\n}', forEach: 'array.forEach(elemento => {\n    console.log(elemento);\n});' },
                    funciones: { declaracion: 'function sumar(a, b) {\n    return a + b;\n}', arrow: 'const sumar = (a, b) => a + b;' }
                },
                python: {
                    sintaxis: { holaMundo: 'print("Hola Mundo")', variables: 'numero = 10\ntexto = "Hola"' },
                    condicionales: { if: 'if condicion:\n    # código\nelse:\n    # código' },
                    bucles: { for: 'for i in range(10):\n    print(i)', while: 'while condicion:\n    # código' }
                }
            },
            aprenderPalabra(palabra, contexto, sinonimos = []) {
                const palabraLower = palabra.toLowerCase();
                if (!this.vocabulario.palabras[palabraLower]) {
                    this.vocabulario.palabras[palabraLower] = { sinonimos, frecuencia: 1, ultimoUso: Date.now(), contextos: [contexto] };
                    console.log(`📖 IA aprendió: "${palabra}"`);
                } else {
                    this.vocabulario.palabras[palabraLower].frecuencia++;
                }
                this.guardar();
            },
            aprenderCodigo(lenguaje, tema, subtema, codigo) {
                if (!this.programacion[lenguaje]) this.programacion[lenguaje] = {};
                if (!this.programacion[lenguaje][tema]) this.programacion[lenguaje][tema] = {};
                this.programacion[lenguaje][tema][subtema] = codigo;
                this.guardar();
                console.log(`💻 IA aprendió código: ${lenguaje}.${tema}.${subtema}`);
            },
            buscarRespuestaSimilar(pregunta) {
                const palabrasPregunta = this.extraerPalabrasClave(pregunta);
                if (palabrasPregunta.length === 0) return null;
                for (let r of this.memoria.preguntasRespondidas) {
                    if (r.feedback === "positivo") {
                        const palabrasRespuesta = this.extraerPalabrasClave(r.pregunta);
                        const coincidencias = palabrasPregunta.filter(p => palabrasRespuesta.includes(p));
                        if (coincidencias.length >= palabrasPregunta.length * 0.6) {
                            return { respuesta: r.respuesta, confianza: coincidencias.length / palabrasPregunta.length };
                        }
                    }
                }
                return null;
            },
            consultarProgramacion(pregunta) {
                const preguntaLower = pregunta.toLowerCase();
                let lenguaje = null, tema = null, subtema = null;
                if (preguntaLower.includes("java") && !preguntaLower.includes("javascript")) lenguaje = "java";
                else if (preguntaLower.includes("javascript") || preguntaLower.includes("js")) lenguaje = "javascript";
                else if (preguntaLower.includes("python")) lenguaje = "python";
                if (!lenguaje) return null;
                if (preguntaLower.includes("hola mundo")) { tema = "sintaxis"; subtema = "holaMundo"; }
                else if (preguntaLower.includes("variable")) { tema = "sintaxis"; subtema = "variables"; }
                else if (preguntaLower.includes("if") || preguntaLower.includes("else")) { tema = "condicionales"; subtema = "if"; }
                else if (preguntaLower.includes("for")) { tema = "bucles"; subtema = "for"; }
                else if (preguntaLower.includes("while")) { tema = "bucles"; subtema = "while"; }
                else if (preguntaLower.includes("función") || preguntaLower.includes("funcion")) { tema = "funciones"; subtema = "declaracion"; }
                if (tema && this.programacion[lenguaje] && this.programacion[lenguaje][tema] && this.programacion[lenguaje][tema][subtema]) {
                    return { lenguaje, tema, subtema, codigo: this.programacion[lenguaje][tema][subtema] };
                }
                return null;
            },
            extraerPalabrasClave(texto) {
                const palabras = texto.toLowerCase().match(/\b[a-záéíóúñ]{4,}\b/g) || [];
                const comunes = ["como", "cuando", "donde", "porque", "para", "que", "con", "sin", "sobre", "este", "esta", "esto", "estos", "estas"];
                return [...new Set(palabras.filter(p => !comunes.includes(p) && p.length > 3))];
            },
            guardar() {
                try {
                    localStorage.setItem("reprompt_aprendizaje_ia", JSON.stringify({
                        vocabulario: this.vocabulario, codigo: this.codigo,
                        memoria: { aciertos: this.memoria.aciertos, errores: this.memoria.errores, preguntasRespondidas: this.memoria.preguntasRespondidas },
                        programacion: this.programacion
                    }));
                } catch(e) {}
            },
            cargar() {
                try {
                    const guardado = localStorage.getItem("reprompt_aprendizaje_ia");
                    if (guardado) {
                        const data = JSON.parse(guardado);
                        if (data.vocabulario) this.vocabulario = data.vocabulario;
                        if (data.memoria) {
                            this.memoria.aciertos = data.memoria.aciertos || 0;
                            this.memoria.errores = data.memoria.errores || 0;
                            this.memoria.preguntasRespondidas = data.memoria.preguntasRespondidas || [];
                        }
                        if (data.programacion) this.programacion = data.programacion;
                    }
                } catch(e) {}
            },
            autoEvaluar() {
                const total = this.memoria.aciertos + this.memoria.errores;
                const precision = total > 0 ? (this.memoria.aciertos / total) * 100 : 0;
                console.log(`📊 Auto-evaluación IA: ${precision.toFixed(1)}%`);
                return { aciertos: this.memoria.aciertos, errores: this.memoria.errores, precision };
            }
        };
        
        this.aprendizaje.cargar();
        
        // ==================== INICIALIZACIÓN ====================
        this.inicializar();
        this.inicializarOrganizacionDiaria();
        this.verificarGeminiConReintento();
        this.cargarPerfilCuestionarios();
        this.cargarInformacionUsuario();
    }
    
    // ==================== DETECTOR DE INTENCIONES CON VOCABULARIO COMPLETO ====================
    
    detectarIntencion(texto) {
        const textoLower = texto.toLowerCase();
        let mejorIntencion = null;
        let mejorPuntaje = 0;
        let todasCoincidencias = [];
        
        for (const [intencion, config] of Object.entries(this.vocabularioIntenciones)) {
            let puntaje = 0;
            let palabrasCoincidentes = [];
            
            for (const palabra of config.palabras) {
                if (textoLower.includes(palabra.toLowerCase())) {
                    puntaje += config.peso;
                    palabrasCoincidentes.push(palabra);
                }
            }
            
            // Bonus por contexto de conversación (si el usuario sigue el mismo tema)
            if (this.memoria.ultimoTema === intencion && puntaje > 0) {
                puntaje += 3;
            }
            
            if (puntaje > 0) {
                todasCoincidencias.push({ intencion, puntaje, palabras: palabrasCoincidentes });
                if (puntaje > mejorPuntaje) {
                    mejorPuntaje = puntaje;
                    mejorIntencion = intencion;
                }
            }
        }
        
        // Si hay múltiples intenciones, elegir la de mayor peso
        if (todasCoincidencias.length > 1) {
            todasCoincidencias.sort((a, b) => b.puntaje - a.puntaje);
            mejorIntencion = todasCoincidencias[0].intencion;
            mejorPuntaje = todasCoincidencias[0].puntaje;
        }
        
        if (mejorIntencion && mejorPuntaje >= 5) {
            const confianza = Math.min(mejorPuntaje / 30, 0.98);
            console.log(`🎯 Intención detectada: ${mejorIntencion} (confianza: ${confianza.toFixed(2)}, puntaje: ${mejorPuntaje})`);
            return { intencion: mejorIntencion, confianza, puntaje: mejorPuntaje };
        }
        
        console.log(`🎯 Intención no detectada claramente, usando conversación general`);
        return { intencion: "conversacion_general", confianza: 0.5, puntaje: 0 };
    }
    
    // ==================== DETECTOR INTELIGENTE DE MÚSICA ====================
    
    detectarMusicaInteligente(texto) {
        const textoLower = texto.toLowerCase();
        
        // Palabras que ANULAN la detección de música (prioridad más alta)
        const palabrasNoMusica = ["meta", "metas", "objetivo", "objetivos", "logro", "logros", "tarea", "progreso", "avance", "hábito", "habito", "hábitos", "habitos", "completar", "cumplir", "alcanzar"];
        
        for (const palabra of palabrasNoMusica) {
            if (textoLower.includes(palabra)) {
                console.log(`🎵 [Música] Anulada por palabra: "${palabra}"`);
                return { esMusica: false, categoria: null, razon: `contiene "${palabra}"` };
            }
        }
        
        // Palabras que indican música (específicas)
        const palabrasMusica = ["música", "canción", "canciónes", "melodía", "audio", "sonido", "playlist", "lista de reproducción"];
        
        const tienePalabraMusica = palabrasMusica.some(p => textoLower.includes(p));
        
        // Verbos específicos de música (NO incluir "pon" solo)
        const verbosMusica = ["reproduce", "reproducir", "escuchar música", "pon música", "ponme música", "reproducir música", "activa música", "enciende música", "coloca música", "reproducir canción", "reproduce canción", "escuchar canción"];
        
        const tieneVerboMusica = verbosMusica.some(v => textoLower.includes(v));
        
        // SOLO es música si tiene palabra de música O verbo específico de música
        const esMusica = tienePalabraMusica || tieneVerboMusica;
        
        if (!esMusica) {
            return { esMusica: false, categoria: null };
        }
        
        // Detectar categoría
        let categoria = null;
        
        if (textoLower.includes("concentración") || textoLower.includes("concentrarme") || textoLower.includes("estudio") || textoLower.includes("trabajo") || textoLower.includes("lofi") || textoLower.includes("clásica") || textoLower.includes("clasica")) {
            categoria = "concentracion";
        } else if (textoLower.includes("dormir") || textoLower.includes("descanso") || textoLower.includes("relaj") || textoLower.includes("sueño") || textoLower.includes("noche") || textoLower.includes("lluvia")) {
            categoria = "dormir";
        } else if (textoLower.includes("meditar") || textoLower.includes("meditación") || textoLower.includes("zen") || textoLower.includes("calma") || textoLower.includes("mindfulness") || textoLower.includes("paz")) {
            categoria = "meditar";
        } else if (textoLower.includes("motivación") || textoLower.includes("motivacional") || textoLower.includes("energía") || textoLower.includes("animar") || textoLower.includes("alegre") || textoLower.includes("feliz") || textoLower.includes("positivo")) {
            categoria = "motivacion";
        }
        
        return { esMusica: true, categoria };
    }
    
    // ==================== MÉTODOS DE RESPUESTA ESPECÍFICOS POR APP ====================
    
    async responderConsultaMetas() {
        this.cargarTodosLosDatos();
        try {
            const metas = JSON.parse(localStorage.getItem("metas_proyectos_v6") || "[]");
            const metasActivas = metas.filter(m => !m.completado);
            const metasCompletadas = metas.filter(m => m.completado);
            
            if (metasActivas.length === 0 && metasCompletadas.length === 0) {
                return {
                    texto: `📭 Aún no tienes metas registradas, ${this.usuario.nombre}. ¿Quieres crear una? Puedes decirme: "Crear meta de aprender programación" o "Nueva meta: hacer ejercicio 3 veces por semana"`,
                    emocion: "neutral",
                    tipoRespuesta: "metas",
                    confianza: 0.98
                };
            }
            
            let mensaje = `🎯 **${this.usuario.nombre}, aquí están tus metas:**\n\n`;
            
            if (metasActivas.length > 0) {
                mensaje += `📋 **En progreso (${metasActivas.length}):**\n`;
                metasActivas.forEach((m, i) => {
                    const barra = this.generarBarraProgreso(m.progreso || 0);
                    mensaje += `${i+1}. ${m.nombre}\n   ${barra} ${m.progreso || 0}%\n`;
                });
            }
            
            if (metasCompletadas.length > 0) {
                mensaje += `\n✅ **Completadas (${metasCompletadas.length}):**\n`;
                metasCompletadas.slice(0, 3).forEach((m, i) => {
                    mensaje += `   ✓ ${m.nombre}\n`;
                });
                if (metasCompletadas.length > 3) {
                    mensaje += `   ... y ${metasCompletadas.length - 3} más\n`;
                }
            }
            
            mensaje += `\n💡 ¿Quieres actualizar el progreso de alguna?`;
            
            this.ganarXP(5, "Consulta de metas");
            this.memoria.ultimoTema = "consultar_metas";
            
            return {
                texto: mensaje,
                emocion: "positivo",
                tipoRespuesta: "metas",
                confianza: 0.98,
                datosContexto: { metasActivas: metasActivas.length, metasCompletadas: metasCompletadas.length }
            };
            
        } catch(e) {
            console.error("Error al consultar metas:", e);
            return null;
        }
    }
    
    async responderConsultaProgreso() {
        this.cargarTodosLosDatos();
        
        const metasActivas = this.datos.metas?.activas || 0;
        const metasCompletadas = this.datos.metas?.completadas || 0;
        const rachaHabitos = this.datos.habitos?.rachaTotal || 0;
        const ejerciciosHoy = this.datos.ejercicios?.caloriasHoy || 0;
        const minutosHoy = this.datos.ejercicios?.minutosActivos || 0;
        const suenoAnoche = this.datos.sueno?.horasAnoche || 0;
        const entradasLibro = this.datos.libroVida?.totalEntradas || 0;
        const nivel = this.memoria.evolucion.nivelActual;
        const xp = this.memoria.evolucion.xpTotal;
        const nombreNivel = this.preguntasPorNivel[`nivel${nivel}`]?.nombre || "Explorador";
        
        let mensaje = `📊 **${this.usuario.nombre}, aquí está tu progreso:**\n\n`;
        mensaje += `🎯 **Nivel ${nivel} - ${nombreNivel}** | ✨ ${xp} XP\n`;
        mensaje += `📖 ${entradasLibro} reflexiones en tu Libro de Vida\n`;
        mensaje += `🎯 ${metasCompletadas} metas completadas, ${metasActivas} en progreso\n`;
        mensaje += `🔄 Racha de hábitos: ${rachaHabitos} días\n`;
        
        if (ejerciciosHoy > 0) {
            mensaje += `🏃 Hoy has hecho ${minutosHoy} minutos de ejercicio, quemando ${ejerciciosHoy} kcal. ¡Excelente!\n`;
        } else {
            mensaje += `🏃 ¿Qué tal si haces un poco de ejercicio hoy, ${this.usuario.nombre}? Te ayudará con la energía.\n`;
        }
        
        if (suenoAnoche > 0) {
            mensaje += `😴 Anoche dormiste ${suenoAnoche} horas.\n`;
        }
        
        if (this.memoria.perfilPsicologico.fortalezas && this.memoria.perfilPsicologico.fortalezas.length > 0) {
            const fortalezaStr = Array.isArray(this.memoria.perfilPsicologico.fortalezas) 
                ? this.memoria.perfilPsicologico.fortalezas[0] 
                : this.memoria.perfilPsicologico.fortalezas;
            mensaje += `\n💪 Recuerda que una de tus fortalezas es: ${fortalezaStr}. ¡Aprovéchala hoy!`;
        }
        
        mensaje += `\n\n💭 ¿Hay algo específico de lo que quieras saber más, ${this.usuario.nombre}?`;
        
        this.ganarXP(5, "Consulta de progreso");
        this.memoria.ultimoTema = "consultar_progreso";
        
        return {
            texto: mensaje,
            emocion: "positivo",
            tipoRespuesta: "progreso",
            confianza: 0.98,
            datosContexto: { nivel, xp, metasActivas, metasCompletadas, rachaHabitos }
        };
    }
    
    async responderConsultaHabitos() {
        this.cargarTodosLosDatos();
        try {
            const habitos = JSON.parse(localStorage.getItem("habitos_v4") || "[]");
            const hoy = new Date().toISOString().split('T')[0];
            
            if (habitos.length === 0) {
                return {
                    texto: `🔄 No tienes hábitos aún, ${this.usuario.nombre}. ¿Quieres crear uno? Por ejemplo: "Crear hábito de meditar 10 minutos" o "Agregar hábito de leer 20 páginas diarias"`,
                    emocion: "neutral",
                    tipoRespuesta: "habitos",
                    confianza: 0.95
                };
            }
            
            let mensaje = `🔄 **Tus hábitos, ${this.usuario.nombre}:**\n\n`;
            habitos.slice(0, 5).forEach(h => {
                const completadoHoy = h.completados?.includes(hoy);
                const status = completadoHoy ? "✅" : "⭕";
                mensaje += `${status} ${h.nombre} | 🔥 Racha: ${h.racha || 0} días\n`;
            });
            mensaje += `\n💪 ¿Completaste algún hábito hoy, ${this.usuario.nombre}?`;
            
            this.ganarXP(3, "Consulta de hábitos");
            this.memoria.ultimoTema = "consultar_habitos";
            
            return {
                texto: mensaje,
                emocion: "neutral",
                tipoRespuesta: "habitos",
                confianza: 0.95
            };
            
        } catch(e) {
            return {
                texto: `🔄 ¿Qué hábitos te gustaría desarrollar, ${this.usuario.nombre}?`,
                emocion: "neutral",
                tipoRespuesta: "habitos",
                confianza: 0.9
            };
        }
    }
    
    async responderConsultaEjercicios() {
        this.cargarTodosLosDatos();
        const ejercicios = this.datos.ejercicios;
        if (ejercicios.caloriasHoy > 0) {
            return {
                texto: `🏃 ${this.usuario.nombre}, hoy has hecho ${ejercicios.caloriasHoy} kcal y ${ejercicios.minutosActivos} minutos. ${ejercicios.racha > 0 ? `Llevas ${ejercicios.racha} días seguidos.` : ''} ¡Sigue así!`,
                emocion: "positivo",
                tipoRespuesta: "ejercicios",
                confianza: 0.95
            };
        } else {
            return {
                texto: `🏃 Aún no has registrado ejercicio hoy, ${this.usuario.nombre}. ¿Qué tal si empiezas con 10 minutos de caminata?`,
                emocion: "neutral",
                tipoRespuesta: "ejercicios",
                confianza: 0.9
            };
        }
    }
    
    async responderConsultaSueno() {
        this.cargarTodosLosDatos();
        const sueno = this.datos.sueno;
        if (sueno.horasAnoche > 0) {
            let mensaje = `😴 Gracias por compartir, ${this.usuario.nombre}. Anoche dormiste ${sueno.horasAnoche} horas.`;
            if (sueno.calidad > 0) mensaje += ` Calidad: ${sueno.calidad}/10.`;
            if (sueno.horasAnoche < 7) mensaje += ` Recuerda que lo ideal son 7-8 horas. ¿Qué te impide dormir más?`;
            else mensaje += ` ¡Excelente descanso! Eso se nota en tu energía.`;
            return {
                texto: mensaje,
                emocion: "neutral",
                tipoRespuesta: "sueno",
                confianza: 0.95
            };
        } else {
            return {
                texto: `😴 No tengo registro de tu sueño de anoche, ${this.usuario.nombre}. ¿Cómo dormiste? Dormir bien es fundamental para tu bienestar.`,
                emocion: "neutral",
                tipoRespuesta: "sueno",
                confianza: 0.9
            };
        }
    }
    
    async responderConsultaLogros() {
        this.cargarTodosLosDatos();
        const logros = this.datos.logros;
        let mensaje = `🏆 ${this.usuario.nombre}, has obtenido ${logros.total} logros.`;
        if (logros.recientes && logros.recientes.length > 0) {
            mensaje += ` Los más recientes: ${logros.recientes.slice(0, 3).join(", ")}`;
        }
        mensaje += ` ¡Sigue así!`;
        return {
            texto: mensaje,
            emocion: "positivo",
            tipoRespuesta: "logros",
            confianza: 0.95
        };
    }
    
    async responderConsultaComunidad() {
        this.cargarTodosLosDatos();
        const comunidad = this.datos.comunidad;
        return {
            texto: `🌍 ${this.usuario.nombre}, has compartido ${comunidad.misPublicaciones} publicaciones y tienes ${comunidad.seguidores} seguidores. ¡La comunidad te valora!`,
            emocion: "positivo",
            tipoRespuesta: "comunidad",
            confianza: 0.95
        };
    }
    
    async responderCrisis(texto) {
        this.cargarTodosLosDatos();
        
        // Palabras de alarma graves
        const palabrasGraves = ["suicidio", "morir", "muerte", "acabar con todo", "no quiero vivir", "lastimarme", "cortarme"];
        const esGrave = palabrasGraves.some(p => texto.toLowerCase().includes(p));
        
        if (esGrave) {
            return {
                texto: `🆘 **ATENCIÓN IMPORTANTE, ${this.usuario.nombre}**\n\nLo que estás sintiendo es muy importante. No estás solo/a.\n\n📞 **Línea de Prevención del Suicidio (Perú):** 0800-000-000 (opción 3)\n📞 **Línea de Ayuda:** 113 (opción 5)\n💬 **Chat de Apoyo:** disponible 24/7 en tu app\n\nPor favor, contacta con un profesional. Tu vida es valiosa. ¿Quieres que busque ayuda para ti ahora mismo?`,
                emocion: "triste",
                tipoRespuesta: "crisis_grave",
                confianza: 0.99
            };
        }
        
        const crisis = this.datos.crisis;
        if (crisis.planSeguridad) {
            return {
                texto: `🛡️ ${this.usuario.nombre}, tienes un plan de seguridad activo. Recuerda: respira profundo, contacta a tu persona de confianza, y si la crisis es fuerte, llama a la línea de ayuda. ¿Necesitas que repase tu plan contigo?`,
                emocion: "empatico",
                tipoRespuesta: "crisis",
                confianza: 0.95
            };
        } else {
            return {
                texto: `🛡️ ${this.usuario.nombre}, lamento que estés pasando por esto. Quiero que sepas que no estás solo/a. ¿Te gustaría que creemos juntos un plan de seguridad? También puedes contactar a la línea de ayuda: 0800-000-000. Estoy aquí para ti.`,
                emocion: "empatico",
                tipoRespuesta: "crisis",
                confianza: 0.95
            };
        }
    }
    
    async responderConsultaBiblioteca() {
        this.cargarTodosLosDatos();
        const biblioteca = this.datos.biblioteca;
        let mensaje = `📚 ${this.usuario.nombre}, tienes ${biblioteca.totalLibros} libros en tu biblioteca, ${biblioteca.leidos} leídos.`;
        if (biblioteca.favoritos > 0) mensaje += ` Tienes ${biblioteca.favoritos} libros marcados como favoritos.`;
        if (biblioteca.ultimoAgregado) mensaje += ` El último que agregaste fue: "${biblioteca.ultimoAgregado}".`;
        return {
            texto: mensaje,
            emocion: "neutral",
            tipoRespuesta: "biblioteca",
            confianza: 0.95
        };
    }
    
    async responderConsultaMapas() {
        this.cargarTodosLosDatos();
        const mapas = this.datos.mapas;
        return {
            texto: `🗺️ ${this.usuario.nombre}, tienes ${mapas.total} mapas mentales creados. ${mapas.favoritos > 0 ? `${mapas.favoritos} de ellos son tus favoritos.` : ''} ¿Quieres crear uno nuevo?`,
            emocion: "neutral",
            tipoRespuesta: "mapas",
            confianza: 0.95
        };
    }
    
    async responderConsultaPlugins() {
        this.cargarTodosLosDatos();
        const plugins = this.datos.plugins;
        return {
            texto: `🔌 ${this.usuario.nombre}, tienes ${plugins.instalados} plugins instalados, ${plugins.activos} activos. ¿Quieres explorar la tienda para más funcionalidades?`,
            emocion: "neutral",
            tipoRespuesta: "plugins",
            confianza: 0.95
        };
    }
    
    async responderConsultaCuestionarios() {
        this.cargarTodosLosDatos();
        const cuestionarios = this.datos.cuestionarios;
        let mensaje = `📋 ${this.usuario.nombre}, has realizado ${cuestionarios.totalRealizados} cuestionarios.`;
        if (this.memoria.perfilPsicologico.personalidad) {
            mensaje += ` Conozco tu perfil de personalidad. ¿Te gustaría profundizar en algún aspecto específico?`;
        } else {
            mensaje += ` Te recomiendo completar el cuestionario de personalidad para conocerte mejor. ¿Quieres empezar?`;
        }
        return {
            texto: mensaje,
            emocion: "neutral",
            tipoRespuesta: "cuestionarios",
            confianza: 0.95
        };
    }
    
    async responderBienestarEmocional(texto, emocion) {
        this.cargarTodosLosDatos();
        
        // Detectar emoción específica
        let emocionDetectada = null;
        const emocionesLista = ["alegría", "feliz", "triste", "enojo", "ira", "ansiedad", "ansioso", "miedo", "calma", "tranquilo", "motivado", "gratitud", "agradecido", "soledad", "esperanza", "confianza", "inseguro", "orgullo", "vergüenza", "culpa"];
        
        for (const emo of emocionesLista) {
            if (texto.toLowerCase().includes(emo)) {
                emocionDetectada = emo;
                break;
            }
        }
        
        if (emocionDetectada) {
            // Guardar la emoción
            try {
                const emociones = JSON.parse(localStorage.getItem("estados_animo") || "[]");
                emociones.unshift({ emocion: emocionDetectada, fecha: new Date().toISOString() });
                localStorage.setItem("estados_animo", JSON.stringify(emociones.slice(0, 50)));
            } catch(e) {}
            
            const respuestasEmocionales = {
                "triste": "💙 Entiendo que te sientes triste, {nombre}. Está bien sentir eso. ¿Quieres hablar de lo que te tiene así? Estoy aquí para escucharte.",
                "ansiedad": "😰 La ansiedad puede ser abrumadora, {nombre}. Respira profundo conmigo: inhala... exhala... ¿Qué es lo que más te preocupa ahora mismo?",
                "feliz": "😊 ¡Qué bonito, {nombre}! Me alegra mucho que te sientas feliz. ¿Qué te tiene así de contento?",
                "motivado": "💪 ¡Esa energía es increíble, {nombre}! Aprovechemos esa motivación. ¿Qué quieres lograr hoy?",
                "gratitud": "🙏 La gratitud es una de las emociones más poderosas, {nombre}. ¿De qué o quién te sientes agradecido/a?",
                "tranquilo": "😌 La calma es un regalo, {nombre}. ¿Qué te ayudó a sentirte así?",
                "confianza": "✨ Qué bien que te sientas seguro/a, {nombre}. ¿Qué te hace sentir así de confiado/a?"
            };
            
            let respuesta = respuestasEmocionales[emocionDetectada] || `🧠 Gracias por compartir tu emoción, {nombre}. Reconocer cómo te sientes es el primer paso para gestionarlo. ¿Quieres profundizar en esto?`;
            respuesta = respuesta.replace("{nombre}", this.usuario.nombre);
            
            this.ganarXP(3, "Registro emocional");
            this.memoria.ultimoTema = "bienestar_emocional";
            
            return {
                texto: respuesta,
                emocion: emocionDetectada === "triste" ? "triste" : "positivo",
                tipoRespuesta: "bienestar_emocional",
                confianza: 0.95,
                datosContexto: { emocion: emocionDetectada }
            };
        }
        
        return null;
    }
    
    async responderPerfil() {
        let mensaje = `👤 **${this.usuario.nombre}, este es tu perfil actual:**\n\n`;
        mensaje += `📛 Nombre: ${this.usuario.nombre}\n`;
        mensaje += `🎯 Nivel: ${this.memoria.evolucion.nivelActual} (${this.preguntasPorNivel[`nivel${this.memoria.evolucion.nivelActual}`]?.nombre || "Aprendiz"})\n`;
        mensaje += `✨ XP: ${this.memoria.evolucion.xpTotal}\n`;
        
        if (this.memoria.perfilPsicologico.personalidad) {
            mensaje += `🧠 Personalidad: ${this.memoria.perfilPsicologico.personalidad}\n`;
        }
        
        if (this.memoria.perfilPsicologico.fortalezas && this.memoria.perfilPsicologico.fortalezas.length > 0) {
            const fortalezasStr = Array.isArray(this.memoria.perfilPsicologico.fortalezas) 
                ? this.memoria.perfilPsicologico.fortalezas.join(", ") 
                : this.memoria.perfilPsicologico.fortalezas;
            mensaje += `💪 Fortalezas: ${fortalezasStr}\n`;
        }
        
        if (this.memoria.perfilPsicologico.proposito) {
            mensaje += `🎯 Propósito: ${this.memoria.perfilPsicologico.proposito}\n`;
        }
        
        if (this.memoria.informacionUsuario.hobbies && this.memoria.informacionUsuario.hobbies.length > 0) {
            mensaje += `🎨 Hobbies: ${this.memoria.informacionUsuario.hobbies.slice(0, 3).join(", ")}\n`;
        }
        
        mensaje += `\n💡 ¿Quieres actualizar algún dato de tu perfil?`;
        
        return {
            texto: mensaje,
            emocion: "neutral",
            tipoRespuesta: "perfil",
            confianza: 0.95
        };
    }
    
    async responderAyuda() {
        const helpText = `✨ **${this.usuario.nombre}, esto es lo que puedo hacer por ti:** ✨

🎯 **METAS**
• "Crear meta de [nombre]" - Establece un nuevo objetivo
• "Mis metas" - Ver tus metas actuales
• "Mi meta [nombre] va al 50%" - Actualizar progreso

🔄 **HÁBITOS**
• "Crear hábito de [acción]" - Nuevo hábito diario
• "Completé mi hábito de [nombre]" - Marcar como hecho
• "Mis hábitos" - Ver lista y rachas

🏃 **EJERCICIO**
• "Hice 30 minutos de cardio" - Registrar ejercicio
• "Mis ejercicios" - Ver estadísticas

😴 **SUEÑO**
• "Dormí 7 horas calidad 8" - Registrar sueño

🎵 **MÚSICA**
• "Pon música para concentrarme" - Música de estudio
• "Pon música para dormir" - Música relajante
• "Música motivacional" - Energía y ánimo

📊 **PROGRESO**
• "Mi progreso" - Resumen completo de todo

📚 **BIBLIOTECA**
• "Mis libros" - Ver tu biblioteca
• "Agregar libro [título]" - Añadir a tu colección

📖 **LIBRO DE VIDA**
• "Guardar reflexión: [texto]" - Registrar pensamientos

🏆 **LOGROS**
• "Mis logros" - Ver medallas obtenidas

🌍 **COMUNIDAD**
• "Comunidad" - Ver actividad social

🛡️ **CRISIS**
• "No estoy bien" - Recibir apoyo inmediato

📋 **CUESTIONARIOS**
• "Test de personalidad" - Conocerte mejor

👤 **PERFIL**
• "Mi perfil" - Ver tu información
• "Me llamo [nombre]" - Registrar tu nombre

💬 **¿Qué te gustaría hacer hoy?**`;
        
        return {
            texto: helpText,
            emocion: "neutral",
            tipoRespuesta: "ayuda",
            confianza: 0.98
        };
    }
    
    generarBarraProgreso(porcentaje) {
        const lleno = Math.floor(porcentaje / 10);
        const vacio = 10 - lleno;
        return '█'.repeat(lleno) + '░'.repeat(vacio);
    }
    
    // ==================== CONFIGURACIÓN GEMINI API ====================
    
    cargarPerfilCuestionarios() {
        try {
            const respuestas = JSON.parse(localStorage.getItem("cuestionarios_respuestas") || "{}");
            const completados = JSON.parse(localStorage.getItem("cuestionarios_completados") || "[]");
            
            this.datos.cuestionarios.totalRealizados = completados.length;
            this.datos.cuestionarios.resultados = respuestas;
            
            if (respuestas.big_five && respuestas.big_five.interpretacion) {
                this.memoria.perfilPsicologico.personalidad = respuestas.big_five.interpretacion;
            }
            
            if (respuestas.inteligencia_emocional && respuestas.inteligencia_emocional.interpretacion) {
                this.memoria.perfilPsicologico.inteligenciaEmocional = respuestas.inteligencia_emocional.interpretacion;
            }
            
            if (respuestas.aprendizaje && respuestas.aprendizaje.interpretacion) {
                this.memoria.perfilPsicologico.estiloAprendizaje = respuestas.aprendizaje.interpretacion;
            }
            
            if (respuestas.fortalezas && respuestas.fortalezas.interpretacion) {
                this.memoria.perfilPsicologico.fortalezas = respuestas.fortalezas.interpretacion;
            }
            
            if (respuestas.mindset && respuestas.mindset.interpretacion) {
                this.memoria.perfilPsicologico.mindset = respuestas.mindset.interpretacion;
            }
            
            if (respuestas.proposito && respuestas.proposito.interpretacion) {
                this.memoria.perfilPsicologico.proposito = respuestas.proposito.interpretacion;
                this.usuario.proposito = respuestas.proposito.interpretacion;
            }
            
            if (respuestas.perfil_basico) {
                if (respuestas.perfil_basico.edad) {
                    this.memoria.informacionUsuario.edad = respuestas.perfil_basico.edad;
                }
                if (respuestas.perfil_basico.ocupacion) {
                    this.memoria.informacionUsuario.ocupacion = respuestas.perfil_basico.ocupacion;
                }
                if (respuestas.perfil_basico.motivacion) {
                    this.memoria.informacionUsuario.motivaciones.push(respuestas.perfil_basico.motivacion);
                }
            }
            
            console.log("📊 Perfil psicológico cargado desde cuestionarios");
            console.log(`   Personalidad: ${this.memoria.perfilPsicologico.personalidad ? "✓" : "Pendiente"}`);
            console.log(`   IE: ${this.memoria.perfilPsicologico.inteligenciaEmocional ? "✓" : "Pendiente"}`);
            console.log(`   Fortalezas: ${this.memoria.perfilPsicologico.fortalezas ? "✓" : "Pendiente"}`);
            console.log(`   Propósito: ${this.memoria.perfilPsicologico.proposito ? "✓" : "Pendiente"}`);
            
        } catch(e) {
            console.log("No se encontraron cuestionarios completados");
        }
    }
    
    cargarInformacionUsuario() {
        try {
            const infoGuardada = localStorage.getItem("reprompt_usuario_info");
            if (infoGuardada) {
                const info = JSON.parse(infoGuardada);
                this.memoria.informacionUsuario = info;
                if (info.nombre && info.nombre !== "Usuario") {
                    this.usuario.nombre = info.nombre;
                }
            }
        } catch(e) {}
        
        try {
            const perfil = JSON.parse(localStorage.getItem("reprompt_perfil_v6") || "{}");
            if (perfil.nombre && perfil.nombre !== "Usuario") {
                this.usuario.nombre = perfil.nombre;
                this.memoria.informacionUsuario.nombre = perfil.nombre;
            }
        } catch(e) {}
        
        try {
            const user = JSON.parse(localStorage.getItem("repromt_user") || "{}");
            if (user.nombre && user.nombre !== "Usuario") {
                this.usuario.nombre = user.nombre;
                this.memoria.informacionUsuario.nombre = user.nombre;
            }
        } catch(e) {}
        
        console.log(`👤 Usuario: ${this.usuario.nombre}`);
    }
    
    guardarInformacionUsuario() {
        try {
            localStorage.setItem("reprompt_usuario_info", JSON.stringify(this.memoria.informacionUsuario));
        } catch(e) {}
    }
    
    // ==================== FUNCIONES DE MÚSICA ====================
    
    reproducirMusica(categoria, busqueda = null) {
        console.log(`🎵 IA: Reproducir música - Categoría: ${categoria}`);
        
        const tracksPorCategoria = {
            concentracion: { id: 1, nombre: "LoFi Hip Hop Radio", artista: "LoFi Girl", duracion: "∞", youtubeId: "5qap5aO4i9A", tipo: "live" },
            dormir: { id: 4, nombre: "528 Hz - Sanación Profunda", artista: "Frecuencia del Amor", duracion: "∞", youtubeId: "YkBntoPOOUM", tipo: "live" },
            meditar: { id: 7, nombre: "Meditación Guiada", artista: "Mindfulness", duracion: "30 min", youtubeId: "inpok4MKVLM", tipo: "video" },
            motivacion: { id: 9, nombre: "Música Motivacional", artista: "Epic Music", duracion: "60 min", youtubeId: "ASj81daun5Q", tipo: "video" }
        };
        
        let categoriaNormalizada = categoria;
        const catLower = categoria.toLowerCase();
        if (catLower.includes("concent") || catLower.includes("estudio") || catLower.includes("trabajo") || catLower.includes("lofi") || catLower.includes("clasica")) {
            categoriaNormalizada = "concentracion";
        } else if (catLower.includes("dorm") || catLower.includes("descans") || catLower.includes("relaj") || catLower.includes("sueno") || catLower.includes("noche") || catLower.includes("lluvia")) {
            categoriaNormalizada = "dormir";
        } else if (catLower.includes("medit") || catLower.includes("zen") || catLower.includes("calma") || catLower.includes("mindfulness") || catLower.includes("paz")) {
            categoriaNormalizada = "meditar";
        } else if (catLower.includes("motiv") || catLower.includes("energ") || catLower.includes("anim") || catLower.includes("alegre") || catLower.includes("feliz") || catLower.includes("positivo")) {
            categoriaNormalizada = "motivacion";
        }
        
        const track = tracksPorCategoria[categoriaNormalizada];
        if (!track) {
            console.log(`⚠️ No hay track para: ${categoria}`);
            return false;
        }
        
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({
                type: 'REPROMPT_MUSIC_PLAY',
                track: track
            }, '*');
            console.log(`✅ Enviado al sistema padre: ${track.nombre}`);
            return true;
        }
        
        const event = new CustomEvent('reprompt-music-command', {
            detail: { action: 'play', track: track }
        });
        window.dispatchEvent(event);
        console.log(`✅ Evento enviado: reprompt-music-command`);
        
        return true;
    }
    
    reproducirAudiolibro(titulo, autor) {
        console.log(`📖 IA: Reproducir audiolibro - ${titulo}`);
        
        let track = null;
        const textoLower = titulo.toLowerCase();
        
        if (textoLower.includes("hábitos") || textoLower.includes("atomicos")) {
            track = { id: 11, nombre: "Hábitos Atómicos", artista: "James Clear", duracion: "15 min", youtubeId: "U5PZmN4wI2s", tipo: "video" };
        } else if (textoLower.includes("poder") || textoLower.includes("ahora")) {
            track = { id: 12, nombre: "El Poder del Ahora", artista: "Eckhart Tolle", duracion: "20 min", youtubeId: "xLJotO8OEo8", tipo: "video" };
        } else {
            track = { id: 11, nombre: titulo, artista: autor || "Desconocido", duracion: "30 min", youtubeId: "U5PZmN4wI2s", tipo: "video" };
        }
        
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({
                type: 'REPROMPT_AUDIO_PLAY',
                track: track
            }, '*');
            console.log(`✅ Enviado audiolibro al sistema padre: ${track.nombre}`);
            return true;
        }
        return false;
    }
    
    abrirAppMusica() {
        if (window.app && window.app.openApp) {
            window.app.openApp('musica');
            console.log('🎵 Abriendo App de Música');
            return true;
        }
        return false;
    }
    
    obtenerPreguntaProactiva() {
        const todasPreguntas = [
            ...this.preguntasProactivas.basico,
            ...this.preguntasProactivas.profundo,
            ...this.preguntasProactivas.contexto
        ];
        
        const noRealizadas = todasPreguntas.filter(p => !this.memoria.preguntasRealizadas.has(p));
        
        let pregunta;
        if (noRealizadas.length > 0) {
            pregunta = noRealizadas[Math.floor(Math.random() * noRealizadas.length)];
        } else {
            this.memoria.preguntasRealizadas.clear();
            pregunta = todasPreguntas[Math.floor(Math.random() * todasPreguntas.length)];
        }
        
        this.memoria.preguntasRealizadas.add(pregunta);
        return pregunta;
    }
    
    procesarRespuestaProactiva(pregunta, respuesta) {
        const respuestaLower = respuesta.toLowerCase();
        const info = this.memoria.informacionUsuario;
        
        if (pregunta.includes("apasiona")) {
            info.hobbies.push(respuesta);
        } else if (pregunta.includes("fortaleza")) {
            info.fortalezas.push(respuesta);
            this.memoria.perfilPsicologico.fortalezas = respuesta;
        } else if (pregunta.includes("miedo")) {
            info.miedos.push(respuesta);
        } else if (pregunta.includes("motiva")) {
            info.motivaciones.push(respuesta);
        } else if (pregunta.includes("éxito")) {
            this.usuario.valores.push(respuesta);
        } else if (pregunta.includes("sueño")) {
            this.usuario.proposito = respuesta;
            this.memoria.perfilPsicologico.proposito = respuesta;
        }
        
        this.guardarInformacionUsuario();
        console.log(`📝 Información guardada: ${pregunta.substring(0, 40)}... -> ${respuesta.substring(0, 40)}...`);
    }
    
    inicializar() {
        console.log("🧠 REPROMPT Intelligence v36.0.0 - INTELIGENCIA TOTAL - 18 SISTEMAS");
        console.log("✨ Usando modelo: " + this.gemini.model);
        console.log("🎯 XP actual: " + this.memoria.evolucion.xpTotal);
        
        this.cargarTodo();
        this.cargarDatosReprompt();
        this.cargarOrganizacion();
        this.detectarArquetipo();
        this.mostrarEstadisticas();
        this.calcularNivelInicial();
    }
    
    mostrarEstadisticas() {
        console.log(`✨ NIVEL: ${this.memoria.evolucion.nivelActual} | XP: ${this.memoria.evolucion.xpTotal}`);
        console.log(`🤖 Gemini API: ${this.gemini.disponible ? "CONECTADO ✅" : "VERIFICANDO..."}`);
        console.log(`👤 Usuario: ${this.usuario.nombre}`);
        console.log(`📊 Cuestionarios: ${this.datos.cuestionarios.totalRealizados} completados`);
        console.log(`📚 Auto-aprendizaje: ${Object.keys(this.aprendizaje.vocabulario.palabras).length} palabras aprendidas`);
    }
    
    async verificarGeminiConReintento() {
        let intento = 0;
        const maxIntentos = 3;
        
        while (intento < maxIntentos && !this.gemini.disponible) {
            try {
                const conectado = await this.verificarGemini();
                if (conectado) return true;
                
                intento++;
                if (intento < maxIntentos) {
                    const tiempoEspera = this.gemini.tiempoEsperaBase * Math.pow(2, intento - 1);
                    console.log(`⏳ Reintentando en ${tiempoEspera/1000} segundos... (Intento ${intento + 1}/${maxIntentos})`);
                    await new Promise(resolve => setTimeout(resolve, tiempoEspera));
                }
            } catch (error) {
                console.log(`⚠️ Error en intento ${intento + 1}:`, error.message);
                intento++;
                if (intento < maxIntentos) {
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            }
        }
        
        if (!this.gemini.disponible) {
            console.log("⚠️ Modo offline activado - Puedes seguir usando el asistente");
            console.log("💡 Las respuestas serán locales hasta que la API se recupere");
        }
        return false;
    }
    
    async verificarGemini() {
        try {
            const url = `${this.gemini.baseUrl}/models/${this.gemini.model}:generateContent?key=${this.gemini.apiKey}`;
            
            console.log("🔍 Verificando conexión con Gemini...");
            
            const payload = {
                contents: [{ parts: [{ text: "Hola" }] }],
                generationConfig: { maxOutputTokens: 5 }
            };
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);
            
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.status === 429) {
                console.log("⏳ API saturada (429), esperando recuperación...");
                return false;
            }
            
            if (response.ok) {
                this.gemini.disponible = true;
                console.log("✅ Gemini API CONECTADA!");
                console.log("🎉 ¡La IA ahora tiene inteligencia real!");
                return true;
            }
            
            return false;
            
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log("⏳ Timeout en verificación");
            }
            return false;
        }
    }
    
    async generarConGemini(analisis, reintento = 0) {
        if (!this.gemini.disponible) return null;
        
        try {
            const url = `${this.gemini.baseUrl}/models/${this.gemini.model}:generateContent?key=${this.gemini.apiKey}`;
            
            let infoPersonalidad = "";
            if (this.memoria.perfilPsicologico.personalidad) {
                infoPersonalidad += `\nPerfil de personalidad: ${this.memoria.perfilPsicologico.personalidad.substring(0, 100)}`;
            }
            if (this.memoria.perfilPsicologico.fortalezas) {
                const fortalezasStr = Array.isArray(this.memoria.perfilPsicologico.fortalezas) 
                    ? this.memoria.perfilPsicologico.fortalezas.join(", ") 
                    : this.memoria.perfilPsicologico.fortalezas;
                infoPersonalidad += `\nFortalezas: ${fortalezasStr}`;
            }
            if (this.memoria.perfilPsicologico.proposito) {
                infoPersonalidad += `\nPropósito: ${this.memoria.perfilPsicologico.proposito}`;
            }
            
            let contextoDatos = "";
            if (this.datos.metas.activas > 0) {
                contextoDatos += `\nTiene ${this.datos.metas.activas} metas activas.`;
            }
            if (this.datos.habitos.rachaTotal > 0) {
                contextoDatos += `\nRacha de hábitos: ${this.datos.habitos.rachaTotal} días.`;
            }
            
            let sistemaPrompt = `Eres REPROMPT, un consejero personal cálido, empático y sabio. Formas parte del sistema operativo de desarrollo personal Reprompt OS.
Usuario: ${this.usuario.nombre}
Emoción: ${analisis.emocionPrincipal}
${infoPersonalidad}
${contextoDatos}

Responde de forma natural, cálida y breve (1-2 líneas). Usa el nombre del usuario en tu respuesta.`;

            const payload = {
                contents: [{ parts: [{ text: sistemaPrompt + "\n\nUsuario: " + analisis.original + "\n\nREPROMPT:" }] }],
                generationConfig: {
                    temperature: this.gemini.temperature,
                    maxOutputTokens: this.gemini.maxTokens
                }
            };
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.gemini.timeout);
            
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.status === 429) {
                if (reintento < 2) {
                    const espera = 3000 * (reintento + 1);
                    console.log(`⏳ API saturada, esperando ${espera/1000}s antes de reintentar...`);
                    await new Promise(resolve => setTimeout(resolve, espera));
                    return this.generarConGemini(analisis, reintento + 1);
                }
                console.log("⏳ Límite de peticiones, usando respuesta local");
                return null;
            }
            
            if (!response.ok) return null;
            
            const data = await response.json();
            let respuesta = data.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (respuesta) {
                respuesta = respuesta.trim();
                return {
                    texto: respuesta,
                    tipo: "generativa",
                    confianza: 0.95
                };
            }
            
            return null;
            
        } catch (error) {
            if (reintento < 2 && error.name !== 'AbortError') {
                await new Promise(resolve => setTimeout(resolve, 2000));
                return this.generarConGemini(analisis, reintento + 1);
            }
            return null;
        }
    }
    
    // ==================== ANÁLISIS DE TEXTO CON CONTEXTO ====================
    
    analizarProfundamente(texto) {
        const textoLower = texto.toLowerCase();
        const textoTrim = texto.trim();
        
        let emocion = "neutral";
        if (textoLower.includes("triste") || textoLower.includes("deprimido") || textoLower.includes("mal") || textoLower.includes("llorar")) emocion = "triste";
        else if (textoLower.includes("feliz") || textoLower.includes("alegre") || textoLower.includes("contento") || textoLower.includes("genial")) emocion = "feliz";
        else if (textoLower.includes("motivado") || textoLower.includes("energía") || textoLower.includes("inspirado")) emocion = "motivado";
        else if (textoLower.includes("gracias") || textoLower.includes("agradecido")) emocion = "agradecido";
        else if (textoLower.includes("ansioso") || textoLower.includes("nervioso") || textoLower.includes("preocupado")) emocion = "ansioso";
        
        const criticaRepeticion = /repites|repite|repetir|no funciona|no sirve|sigo igual|mal|gastada|cortando/i.test(textoLower);
        
        const conversacionesRecientes = this.memoria.conversaciones.slice(0, 3);
        let historialContexto = '';
        
        if (conversacionesRecientes.length > 0) {
            historialContexto = '\n\n📜 Contexto de conversación reciente:\n';
            conversacionesRecientes.forEach(conv => {
                historialContexto += `Usuario dijo: "${conv.pregunta}"\nREPROMPT respondió: "${conv.respuesta.substring(0, 100)}"\n`;
            });
        }
        
        return {
            emocionPrincipal: emocion,
            criticaRepeticion: criticaRepeticion,
            original: texto,
            historialContexto: historialContexto
        };
    }
    
    // ==================== ACCESO A TODOS LOS 18 SISTEMAS ====================
    
    cargarTodosLosDatos() {
        console.log("📡 Cargando datos de los 18 sistemas...");
        
        try {
            const libro = JSON.parse(localStorage.getItem("reprompt_libro_v3") || '{}');
            this.datos.dashboard = {
                totalEntradas: libro.entradas?.length || 0,
                nivel: this.memoria.evolucion.nivelActual,
                racha: this.usuario.racha || 0
            };
        } catch(e) {}
        
        try {
            const libro = JSON.parse(localStorage.getItem("reprompt_libro_v3") || '{}');
            const emociones = libro.entradas?.filter(e => e.emocion).map(e => e.emocion) || [];
            const conteo = {};
            emociones.forEach(e => { conteo[e] = (conteo[e] || 0) + 1; });
            this.datos.emocional = { ultimaEmocion: emociones[0] || null, resumen: conteo, historial: emociones.slice(0, 10) };
        } catch(e) {}
        
        try {
            this.datos.profesionales = {
                conectados: JSON.parse(localStorage.getItem("profesionales_conectados") || '[]').length,
                proximasCitas: JSON.parse(localStorage.getItem("citas_agendadas") || '[]').length
            };
        } catch(e) {}
        
        try {
            const metas = JSON.parse(localStorage.getItem("metas_proyectos_v6") || '[]');
            this.datos.metas = {
                total: metas.length,
                activas: metas.filter(m => !m.completado).length,
                completadas: metas.filter(m => m.completado).length,
                progresoPromedio: metas.reduce((s, m) => s + (m.progreso || 0), 0) / (metas.length || 1),
                lista: metas.slice(0, 5).map(m => ({ nombre: m.nombre, progreso: m.progreso || 0 }))
            };
        } catch(e) {}
        
        try {
            const habitos = JSON.parse(localStorage.getItem("habitos_v4") || '[]');
            this.datos.habitos = {
                total: habitos.length,
                rachaTotal: habitos.reduce((s, h) => s + (h.racha || 0), 0),
                mejorRacha: Math.max(...habitos.map(h => h.racha || 0), 0),
                activos: habitos.filter(h => h.activo !== false).length,
                lista: habitos.slice(0, 5).map(h => ({ nombre: h.nombre, racha: h.racha || 0 }))
            };
        } catch(e) {}
        
        try {
            const ejercicios = JSON.parse(localStorage.getItem("ejercicios_v4") || '[]');
            const hoy = new Date().toISOString().split('T')[0];
            const ejerciciosHoy = ejercicios.filter(e => e.fecha === hoy);
            this.datos.ejercicios = {
                total: ejercicios.length,
                caloriasHoy: ejerciciosHoy.reduce((s, e) => s + (e.calorias || 0), 0),
                minutosActivos: ejerciciosHoy.reduce((s, e) => s + (e.duracion || 0), 0),
                racha: this.calcularRachaEjercicios(ejercicios),
                ultimoEjercicio: ejercicios[0]?.nombre || null
            };
        } catch(e) {}
        
        try {
            const sueno = JSON.parse(localStorage.getItem("sueno_v4") || '[]');
            const hoy = new Date().toISOString().split('T')[0];
            const suenoAnoche = sueno.find(s => s.fecha === hoy);
            this.datos.sueno = {
                horasAnoche: suenoAnoche?.horas || 0,
                calidad: suenoAnoche?.calidad || 0,
                promedioSemana: this.calcularPromedioSueno(sueno, 7),
                racha: this.calcularRachaSueno(sueno)
            };
        } catch(e) {}
        
        try {
            const musica = JSON.parse(localStorage.getItem("musica_preferencias") || '{}');
            const playlist = JSON.parse(localStorage.getItem("playlists_usuario") || '[]');
            this.datos.musica = {
                generoFavorito: musica.genero || null,
                cancionesFavoritas: musica.favoritas?.length || 0,
                playlistActivas: playlist.length,
                ultimaEscuchada: musica.ultimaCancion || null
            };
        } catch(e) {}
        
        try {
            const publicaciones = JSON.parse(localStorage.getItem("comunidad_publicaciones") || '[]');
            const misPublicaciones = publicaciones.filter(p => p.usuarioId === this.usuario.id);
            this.datos.comunidad = {
                misPublicaciones: misPublicaciones.length,
                interacciones: misPublicaciones.reduce((s, p) => s + (p.likes || 0) + (p.comentarios || 0), 0),
                seguidores: JSON.parse(localStorage.getItem("mis_seguidores") || '[]').length
            };
        } catch(e) {}
        
        try {
            this.datos.crisis = {
                recursosGuardados: JSON.parse(localStorage.getItem("recursos_crisis") || '[]').length,
                planSeguridad: !!localStorage.getItem("plan_seguridad"),
                ultimoRegistro: localStorage.getItem("ultimo_registro_crisis") || null
            };
        } catch(e) {}
        
        try {
            const cuestionarios = JSON.parse(localStorage.getItem("cuestionarios_resultados") || '[]');
            this.datos.cuestionarios = {
                totalRealizados: cuestionarios.length,
                ultimoResultado: cuestionarios[0] || null,
                promedioGeneral: this.calcularPromedioCuestionarios(cuestionarios),
                resultados: JSON.parse(localStorage.getItem("cuestionarios_respuestas") || '{}')
            };
        } catch(e) {}
        
        try {
            const biblioteca = JSON.parse(localStorage.getItem("biblioteca_personal") || '[]');
            this.datos.biblioteca = {
                totalLibros: biblioteca.length,
                leidos: biblioteca.filter(l => l.leido).length,
                favoritos: biblioteca.filter(l => l.favorito).length,
                ultimoAgregado: biblioteca[0]?.titulo || null
            };
        } catch(e) {}
        
        try {
            const logros = JSON.parse(localStorage.getItem("logros_obtenidos") || '[]');
            this.datos.logros = {
                total: logros.length,
                recientes: logros.slice(0, 3),
                nivelLogros: Math.floor(logros.length / 10) + 1
            };
        } catch(e) {}
        
        try {
            this.datos.reportes = {
                estadisticasSemanales: JSON.parse(localStorage.getItem("reportes_semanales") || '{}'),
                ultimoReporte: localStorage.getItem("ultimo_reporte_generado") || null
            };
        } catch(e) {}
        
        try {
            const mapas = JSON.parse(localStorage.getItem("mapas_mentales") || '[]');
            this.datos.mapas = {
                total: mapas.length,
                ultimoCreado: mapas[0]?.nombre || null,
                favoritos: mapas.filter(m => m.favorito).length
            };
        } catch(e) {}
        
        try {
            const syncData = JSON.parse(localStorage.getItem("sincronizacion_global") || '{}');
            this.datos.database = {
                ultimaSincronizacion: syncData.ultimaSincronizacion || null,
                datosSincronizados: Object.keys(syncData).length
            };
        } catch(e) {}
        
        try {
            const plugins = JSON.parse(localStorage.getItem("reprompt_plugins") || '[]');
            this.datos.plugins = {
                instalados: plugins.length,
                activos: plugins.filter(p => p.activo).length,
                lista: plugins.map(p => p.nombre)
            };
        } catch(e) {}
        
        try {
            const libro = JSON.parse(localStorage.getItem("reprompt_libro_v3") || '{}');
            this.datos.libroVida = {
                totalEntradas: libro.entradas?.length || 0,
                porTipo: {
                    texto: libro.entradas?.filter(e => e.tipo === 'texto').length || 0,
                    audio: libro.entradas?.filter(e => e.tipo === 'audio').length || 0,
                    video: libro.entradas?.filter(e => e.tipo === 'video').length || 0,
                    conversacion: libro.entradas?.filter(e => e.tipo === 'conversacion').length || 0
                },
                ultimaEntrada: libro.entradas?.[0]?.fecha || null
            };
        } catch(e) {}
        
        this.actualizarEstadisticasUsuario();
        
        console.log("✅ Datos de los 18 sistemas cargados");
    }
    
    calcularRachaEjercicios(ejercicios) {
        let racha = 0;
        const hoy = new Date().toISOString().split('T')[0];
        let fechaActual = new Date(hoy);
        
        for (let i = 0; i < 30; i++) {
            const fechaStr = fechaActual.toISOString().split('T')[0];
            const hayEjercicio = ejercicios.some(e => e.fecha === fechaStr);
            if (hayEjercicio) racha++;
            else break;
            fechaActual.setDate(fechaActual.getDate() - 1);
        }
        return racha;
    }
    
    calcularPromedioSueno(sueno, dias) {
        const ultimosDias = sueno.slice(0, dias);
        if (ultimosDias.length === 0) return 0;
        const suma = ultimosDias.reduce((s, d) => s + (d.horas || 0), 0);
        return Math.round(suma / ultimosDias.length);
    }
    
    calcularRachaSueno(sueno) {
        let racha = 0;
        const hoy = new Date().toISOString().split('T')[0];
        let fechaActual = new Date(hoy);
        
        for (let i = 0; i < 30; i++) {
            const fechaStr = fechaActual.toISOString().split('T')[0];
            const registro = sueno.find(s => s.fecha === fechaStr);
            if (registro && registro.horas >= 7) racha++;
            else break;
            fechaActual.setDate(fechaActual.getDate() - 1);
        }
        return racha;
    }
    
    calcularPromedioCuestionarios(cuestionarios) {
        if (cuestionarios.length === 0) return 0;
        const suma = cuestionarios.reduce((s, c) => s + (c.puntaje || 0), 0);
        return Math.round(suma / cuestionarios.length);
    }
    
    actualizarEstadisticasUsuario() {
        this.usuario.estadisticas = {
            metasCompletadasHistorial: this.datos.metas?.completadas || 0,
            habitosMantenidos: this.datos.habitos?.activos || 0,
            diasConsecutivos: this.datos.habitos?.rachaTotal || 0,
            reflexionesCompletadas: this.datos.libroVida?.totalEntradas || 0,
            nivelAlcanzado: this.memoria.evolucion.nivelActual,
            ejerciciosCompletados: this.datos.ejercicios?.total || 0,
            horasSuenoPromedio: this.datos.sueno?.promedioSemana || 0
        };
    }
    
    obtenerResumenCompleto() {
        this.cargarTodosLosDatos();
        
        return {
            usuario: {
                nombre: this.usuario.nombre,
                nivel: this.memoria.evolucion.nivelActual,
                xp: this.memoria.evolucion.xpTotal,
                arquetipo: this.usuario.arquetipo,
                perfil: this.memoria.perfilPsicologico
            },
            estadisticas: this.usuario.estadisticas,
            sistemas: {
                metas: this.datos.metas,
                habitos: this.datos.habitos,
                ejercicios: this.datos.ejercicios,
                sueno: this.datos.sueno,
                musica: this.datos.musica,
                comunidad: this.datos.comunidad,
                libroVida: this.datos.libroVida,
                logros: this.datos.logros,
                cuestionarios: this.datos.cuestionarios,
                biblioteca: this.datos.biblioteca,
                profesionales: this.datos.profesionales,
                crisis: this.datos.crisis,
                mapas: this.datos.mapas,
                plugins: this.datos.plugins
            },
            organizacion: this.organizacion.hoy,
            fecha: new Date().toISOString()
        };
    }
    
    // ==================== SISTEMA DE ACCIONES ====================
    
    async ejecutarAccion(texto, analisis) {
        const textoLower = texto.toLowerCase();
        const resultado = {
            accion: null,
            exito: false,
            mensaje: null,
            datos: null
        };
        
        // ========== 1. CREAR METAS ==========
        const crearMetaRegex = /(?:crear|agregar|nueva|registrar|establecer|definir|iniciar|empezar)\s*(?:una\s*)?meta(?:\s*llamada\s*)?["']?([^"'\n]{3,})["']?/i;
        let match = textoLower.match(crearMetaRegex);
        if (match) {
            const nombreMeta = match[1].trim();
            
            resultado.accion = 'crear_meta';
            resultado.datos = { nombre: nombreMeta };
            resultado.exito = true;
            resultado.mensaje = `🎯 Meta "${nombreMeta}" creada con éxito, ${this.usuario.nombre}. ¡Estoy aquí para apoyarte a lograrla!`;
            
            try {
                const metas = JSON.parse(localStorage.getItem("metas_proyectos_v6") || "[]");
                const nuevaMeta = {
                    id: Date.now(),
                    nombre: nombreMeta,
                    completado: false,
                    progreso: 0,
                    fechaCreacion: new Date().toISOString()
                };
                metas.push(nuevaMeta);
                localStorage.setItem("metas_proyectos_v6", JSON.stringify(metas));
                this.ganarXP(10, "Meta creada");
            } catch(e) {
                resultado.mensaje = `❌ Error al crear la meta, ${this.usuario.nombre}: ${e.message}`;
                resultado.exito = false;
            }
            return resultado;
        }
        
        // ========== 2. CREAR HÁBITOS ==========
        const crearHabitoRegex = /(?:crear|agregar|nuevo|establecer|iniciar)\s*(?:un\s*)?h(á|a)bito(?:\s*de\s*)?["']?([^"'\n]{3,})["']?/i;
        match = textoLower.match(crearHabitoRegex);
        if (match) {
            const nombreHabito = match[2] || match[1];
            const nombreLimpio = nombreHabito.replace(/[á]/g, 'a').trim();
            
            resultado.accion = 'crear_habito';
            resultado.datos = { nombre: nombreLimpio };
            resultado.exito = true;
            resultado.mensaje = `🔄 Hábito "${nombreLimpio}" creado, ${this.usuario.nombre}. ¡A practicarlo cada día!`;
            
            try {
                const habitos = JSON.parse(localStorage.getItem("habitos_v4") || "[]");
                const nuevoHabito = {
                    id: Date.now(),
                    nombre: nombreLimpio,
                    racha: 0,
                    completados: [],
                    activo: true,
                    frecuencia: 1,
                    fechaCreacion: new Date().toISOString()
                };
                habitos.push(nuevoHabito);
                localStorage.setItem("habitos_v4", JSON.stringify(habitos));
                this.ganarXP(8, "Hábito creado");
            } catch(e) {
                resultado.mensaje = `❌ Error al crear el hábito, ${this.usuario.nombre}: ${e.message}`;
                resultado.exito = false;
            }
            return resultado;
        }
        
        // ========== 3. REGISTRAR EJERCICIO ==========
        const ejercicioRegex = /(?:registrar|he hecho|hice|realic[ée]|hoy hice)\s*(ejercicio|cardio|running|caminata|yoga|pesas|gimnasio|natación|bici|corr[íi]|trot[ée]|camin[ée])(?:\s*(\d+)\s*(minutos?|min)?)?/i;
        match = textoLower.match(ejercicioRegex);
        if (match) {
            const tipoEjercicio = match[1];
            const minutos = match[2] ? parseInt(match[2]) : 30;
            const calorias = Math.round(minutos * 5);
            
            resultado.accion = 'registrar_ejercicio';
            resultado.datos = { tipo: tipoEjercicio, minutos: minutos, calorias: calorias };
            resultado.exito = true;
            resultado.mensaje = `🏃 ¡Excelente, ${this.usuario.nombre}! Registraste ${minutos} minutos de ${tipoEjercicio}, quemando aproximadamente ${calorias} kcal. ¡Sigue así!`;
            
            try {
                const ejercicios = JSON.parse(localStorage.getItem("ejercicios_v4") || "[]");
                const hoy = new Date().toISOString().split('T')[0];
                const nuevoEjercicio = {
                    id: Date.now(),
                    fecha: hoy,
                    tipo: tipoEjercicio,
                    duracion: minutos,
                    calorias: calorias,
                    timestamp: new Date().toISOString()
                };
                ejercicios.unshift(nuevoEjercicio);
                localStorage.setItem("ejercicios_v4", JSON.stringify(ejercicios));
                this.ganarXP(15, "Ejercicio registrado");
            } catch(e) {
                resultado.mensaje = `❌ Error al registrar ejercicio, ${this.usuario.nombre}: ${e.message}`;
                resultado.exito = false;
            }
            return resultado;
        }
        
        // ========== 4. REGISTRAR SUEÑO ==========
        const suenoRegex = /(?:dorm[íi]|he dormido|registrar sueño|anoche dorm[íi])\s*(\d+(?:\.\d+)?)\s*(?:horas?|hrs?)(?:\s*(?:calidad\s*)?(\d+))?/i;
        match = textoLower.match(suenoRegex);
        if (match) {
            const horas = parseFloat(match[1]);
            const calidad = match[2] ? parseInt(match[2]) : 7;
            
            resultado.accion = 'registrar_sueno';
            resultado.datos = { horas: horas, calidad: calidad };
            resultado.exito = true;
            let mensaje = `😴 Gracias por compartir, ${this.usuario.nombre}. Registraste ${horas} horas de sueño. `;
            if (calidad >= 8) mensaje += `¡Excelente calidad! 🎉`;
            else if (calidad >= 5) mensaje += `Calidad aceptable. ¿Puedes mejorar algo?`;
            else mensaje += `La calidad fue baja. ¿Hubo algo que te interrumpiera?`;
            
            resultado.mensaje = mensaje;
            
            try {
                const sueno = JSON.parse(localStorage.getItem("sueno_v4") || "[]");
                const hoy = new Date().toISOString().split('T')[0];
                const nuevoSueno = {
                    id: Date.now(),
                    fecha: hoy,
                    horas: horas,
                    calidad: calidad,
                    timestamp: new Date().toISOString()
                };
                sueno.unshift(nuevoSueno);
                localStorage.setItem("sueno_v4", JSON.stringify(sueno));
                this.ganarXP(10, "Sueño registrado");
            } catch(e) {
                resultado.mensaje = `❌ Error al registrar sueño, ${this.usuario.nombre}: ${e.message}`;
                resultado.exito = false;
            }
            return resultado;
        }
        
        // ========== 5. REGISTRAR EMOCIÓN ==========
        const emocionRegex = /(?:me siento|estoy|me encuentro|registrar emoción|hoy me siento)\s+(feliz|triste|enojado|ansioso|motivado|cansado|agradecido|emocionado|tranquilo|estresado|contento|preocupado|esperanzado|orgulloso)/i;
        match = textoLower.match(emocionRegex);
        if (match) {
            const emocion = match[1];
            
            resultado.accion = 'registrar_emocion';
            resultado.datos = { emocion: emocion };
            resultado.exito = true;
            
            const emojis = { feliz:'😊', triste:'😢', enojado:'😤', ansioso:'😰', motivado:'💪', cansado:'😴', agradecido:'🙏', emocionado:'🤩', tranquilo:'😌', estresado:'😫', contento:'😊', preocupado:'😟', esperanzado:'🌟', orgulloso:'🦁' };
            resultado.mensaje = `${emojis[emocion] || '🧠'} Gracias por compartir, ${this.usuario.nombre}. Registraste que te sientes ${emocion}. Reconocerlo es el primer paso para gestionarlo.`;
            
            try {
                const emociones = JSON.parse(localStorage.getItem("estados_animo") || "[]");
                const nuevaEmocion = {
                    id: Date.now(),
                    emocion: emocion,
                    fecha: new Date().toISOString()
                };
                emociones.unshift(nuevaEmocion);
                localStorage.setItem("estados_animo", JSON.stringify(emociones.slice(0, 50)));
                this.ganarXP(5, "Emoción registrada");
            } catch(e) {
                resultado.mensaje = `❌ Error al registrar emoción, ${this.usuario.nombre}: ${e.message}`;
                resultado.exito = false;
            }
            return resultado;
        }
        
        // ========== 6. AGREGAR AL LIBRO DE VIDA ==========
        const libroRegex = /(?:guardar|agregar|escribir|anotar|registrar)\s*(?:en mi libro|una reflexión|un pensamiento|esto|en el libro de vida)\s*["']?([^"'\n]{10,})["']?/i;
        match = textoLower.match(libroRegex);
        if (match && texto.length > 15) {
            const entrada = match[1] || texto;
            
            resultado.accion = 'agregar_libro';
            resultado.datos = { entrada: entrada };
            resultado.exito = true;
            resultado.mensaje = `📖 He guardado tu reflexión en el Libro de Vida, ${this.usuario.nombre}. Sigue escribiendo, cada palabra construye tu camino.`;
            
            try {
                const libro = JSON.parse(localStorage.getItem("reprompt_libro_v3") || '{"entradas":[]}');
                const nuevaEntrada = {
                    id: Date.now(),
                    fecha: new Date().toISOString(),
                    tipo: 'texto',
                    contenido: entrada,
                    emocion: analisis.emocionPrincipal || 'reflexivo'
                };
                libro.entradas.unshift(nuevaEntrada);
                localStorage.setItem("reprompt_libro_v3", JSON.stringify(libro));
                this.ganarXP(8, "Entrada en libro");
            } catch(e) {
                resultado.mensaje = `❌ Error al guardar en el libro, ${this.usuario.nombre}: ${e.message}`;
                resultado.exito = false;
            }
            return resultado;
        }
        
        // ========== 7. COMPLETAR HÁBITO ==========
        const completarHabitoRegex = /(?:complet[ée]|hice|realic[ée]|termin[ée]|cumpl[íi] con)\s*(?:mi\s*)?h(á|a)bito(?:\s*de\s*)?["']?([^"'\n]{3,})["']?/i;
        match = textoLower.match(completarHabitoRegex);
        if (match) {
            const nombreHabito = (match[2] || match[1]).trim();
            const nombreLimpio = nombreHabito.replace(/[á]/g, 'a').toLowerCase();
            
            resultado.accion = 'completar_habito';
            resultado.datos = { nombre: nombreLimpio };
            resultado.exito = true;
            resultado.mensaje = `✅ ¡Felicidades, ${this.usuario.nombre}! Completaste "${nombreLimpio}". ¡Sigue así! 🔥`;
            
            try {
                const habitos = JSON.parse(localStorage.getItem("habitos_v4") || "[]");
                const habito = habitos.find(h => h.nombre.toLowerCase().includes(nombreLimpio) || nombreLimpio.includes(h.nombre.toLowerCase()));
                if (habito) {
                    const hoy = new Date().toISOString().split('T')[0];
                    if (!habito.completados) habito.completados = [];
                    if (!habito.completados.includes(hoy)) {
                        habito.completados.push(hoy);
                        habito.racha = (habito.racha || 0) + 1;
                        localStorage.setItem("habitos_v4", JSON.stringify(habitos));
                        this.ganarXP(10, "Hábito completado");
                        resultado.mensaje = `✅ ¡Felicidades, ${this.usuario.nombre}! Completaste "${habito.nombre}". Racha actual: ${habito.racha} días 🔥`;
                    } else {
                        resultado.mensaje = `✅ Ya habías completado "${habito.nombre}" hoy, ${this.usuario.nombre}. ¡Doble mérito!`;
                    }
                } else {
                    resultado.mensaje = `❌ No encontré el hábito "${nombreLimpio}", ${this.usuario.nombre}. ¿Quieres crearlo? Dime "Crear hábito de ${nombreLimpio}"`;
                    resultado.exito = false;
                }
            } catch(e) {
                resultado.mensaje = `❌ Error al completar hábito, ${this.usuario.nombre}: ${e.message}`;
                resultado.exito = false;
            }
            return resultado;
        }
        
        // ========== 8. ACTUALIZAR PROGRESO DE META ==========
        const progresoMetaRegex = /(?:avanc[ée]|progreso|actualizar|voy)\s*(?:mi\s*)?meta\s*["']?([^"'\n]{3,})["']?\s*(?:a|al|va)\s*(\d+)%/i;
        match = textoLower.match(progresoMetaRegex);
        if (match) {
            const nombreMeta = match[1].trim();
            const progreso = parseInt(match[2]);
            
            resultado.accion = 'actualizar_meta';
            resultado.datos = { nombre: nombreMeta, progreso: progreso };
            resultado.exito = true;
            
            try {
                const metas = JSON.parse(localStorage.getItem("metas_proyectos_v6") || "[]");
                const meta = metas.find(m => m.nombre.toLowerCase().includes(nombreMeta.toLowerCase()));
                if (meta) {
                    meta.progreso = progreso;
                    if (progreso >= 100) {
                        meta.completado = true;
                        resultado.mensaje = `🎉 ¡FELICIDADES, ${this.usuario.nombre}! Completaste la meta "${meta.nombre}". ¡Logro desbloqueado! 🏆`;
                        this.ganarXP(25, "Meta completada");
                    } else {
                        resultado.mensaje = `🎯 ¡Qué bien, ${this.usuario.nombre}! Actualicé "${meta.nombre}" al ${progreso}%. ¡Vas por buen camino!`;
                        this.ganarXP(5, "Progreso de meta");
                    }
                    localStorage.setItem("metas_proyectos_v6", JSON.stringify(metas));
                } else {
                    resultado.mensaje = `❌ No encontré la meta "${nombreMeta}", ${this.usuario.nombre}. ¿Quieres crearla?`;
                    resultado.exito = false;
                }
            } catch(e) {
                resultado.mensaje = `❌ Error al actualizar meta, ${this.usuario.nombre}: ${e.message}`;
                resultado.exito = false;
            }
            return resultado;
        }
        
        return resultado;
    }
    
    async procesarConAcciones(texto) {
        const analisis = this.analizarProfundamente(texto);
        const accion = await this.ejecutarAccion(texto, analisis);
        
        if (accion.exito && accion.accion) {
            return {
                texto: accion.mensaje,
                emocion: 'positivo',
                tipoRespuesta: 'accion',
                confianza: 0.98,
                accionRealizada: accion.accion,
                datosAccion: accion.datos
            };
        }
        
        return null;
    }
    
    // ==================== RESPUESTA PRINCIPAL CON CONTEXTO ====================
    
    async respuestaSabia(analisis) {
        // Buscar respuesta aprendida similar
        const respuestaAprendida = this.aprendizaje.buscarRespuestaSimilar(analisis.original);
        if (respuestaAprendida && respuestaAprendida.confianza > 0.7) {
            this.ganarXP(1, "Aprendizaje previo");
            return { texto: respuestaAprendida.respuesta, tipo: "aprendido", confianza: respuestaAprendida.confianza };
        }
        
        // Detectar pregunta sobre el nombre
        const textoLower = analisis.original.toLowerCase();
        if (textoLower.includes("cómo me llamo") || textoLower.includes("sabes mi nombre") || textoLower.includes("cuál es mi nombre") || textoLower.includes("dime mi nombre")) {
            const nombreReal = this.memoria.informacionUsuario.nombre || this.usuario.nombre;
            if (nombreReal && nombreReal !== "Usuario") {
                return { 
                    texto: `¡Claro que sí, ${nombreReal}! Te llamas ${nombreReal}. ¿Cómo podría olvidarlo? 😊`, 
                    tipo: "nombre", 
                    confianza: 0.98 
                };
            } else {
                return { 
                    texto: `Aún no me has dicho tu nombre. ¿Cómo te llamas? Me encantaría saberlo.`, 
                    tipo: "pregunta", 
                    confianza: 0.95 
                };
            }
        }
        
        // Detectar cuando el usuario dice su nombre
        if (textoLower.includes("me llamo") || textoLower.includes("mi nombre es") || (textoLower.includes("soy") && !textoLower.includes("soy capaz"))) {
            const nombreMatch = analisis.original.match(/me llamo\s+([a-záéíóúñ]+)/i) || 
                                analisis.original.match(/mi nombre es\s+([a-záéíóúñ]+)/i) ||
                                analisis.original.match(/soy\s+([a-záéíóúñ]{3,})/i);
            
            if (nombreMatch && nombreMatch[1]) {
                const nuevoNombre = nombreMatch[1].charAt(0).toUpperCase() + nombreMatch[1].slice(1).toLowerCase();
                this.usuario.nombre = nuevoNombre;
                this.memoria.informacionUsuario.nombre = nuevoNombre;
                this.guardarInformacionUsuario();
                
                try {
                    const perfil = JSON.parse(localStorage.getItem("reprompt_perfil_v6") || "{}");
                    perfil.nombre = nuevoNombre;
                    localStorage.setItem("reprompt_perfil_v6", JSON.stringify(perfil));
                } catch(e) {}
                
                return {
                    texto: `✨ ¡Encantado de conocerte, ${nuevoNombre}! Es un placer acompañarte en tu camino de desarrollo personal. ¿En qué puedo ayudarte hoy?`,
                    emocion: "feliz",
                    tipoRespuesta: "presentacion",
                    confianza: 0.98
                };
            }
        }
        
        // Respuestas emocionales
        if (analisis.emocionPrincipal === "triste") {
            const sabio = this.pensamientosSabios[Math.floor(Math.random() * this.pensamientosSabios.length)];
            return { texto: `💙 Entiendo, ${this.usuario.nombre}. ${sabio} ¿Quieres hablar de ello?`, tipo: "empatica", confianza: 0.9 };
        }
        
        if (analisis.emocionPrincipal === "feliz") {
            const afirmacion = this.afirmaciones[Math.floor(Math.random() * this.afirmaciones.length)];
            this.ganarXP(3, "Emoción positiva");
            return { texto: `😊 ¡Qué bueno, ${this.usuario.nombre}! ${afirmacion} ¿Qué te tiene así de feliz?`, tipo: "motivacional", confianza: 0.9 };
        }
        
        if (analisis.emocionPrincipal === "motivado") {
            this.ganarXP(3, "Motivación");
            return { texto: `💪 ¡Esa energía es contagiosa, ${this.usuario.nombre}! ¿Qué te tiene así de motivado?`, tipo: "motivacional", confianza: 0.9 };
        }
        
        if (analisis.emocionPrincipal === "agradecido") {
            return { texto: `🙏 Qué bonito, ${this.usuario.nombre}. La gratitud transforma todo. ¿De qué te sientes agradecido/a hoy?`, tipo: "gratitud", confianza: 0.95 };
        }
        
        if (analisis.emocionPrincipal === "ansioso") {
            return { texto: `😌 Tranquilo/a, ${this.usuario.nombre}. La ansiedad es solo una visita, no se queda para siempre. Respira profundo conmigo: inhala... exhala... ¿Hay algo específico que te preocupa?`, tipo: "calma", confianza: 0.95 };
        }
        
        // Pregunta proactiva después de varias interacciones
        const debePreguntar = this.memoria.conversaciones.length > 3 && 
                               this.memoria.conversaciones.length % 5 === 0 && 
                               this.memoria.preguntasRealizadas.size < 15;
        
        if (debePreguntar) {
            const pregunta = this.obtenerPreguntaProactiva();
            this.memoria.ultimaPreguntaActiva = pregunta;
            return {
                texto: `💭 Antes de continuar, ${this.usuario.nombre}, me gustaría conocerte mejor: ${pregunta}`,
                emocion: "curioso",
                tipoRespuesta: "pregunta_proactiva",
                confianza: 0.9
            };
        }
        
        return { texto: `🌟 Cuéntame más, ${this.usuario.nombre}. Estoy aquí para escucharte y ayudarte en tu camino.`, tipo: "general", confianza: 0.7 };
    }
    
    // ==================== SISTEMA DE XP ====================
    
    calcularNivelInicial() {
        const xp = this.memoria.evolucion.xpTotal;
        let nivel = 1;
        if (xp >= 1000) nivel = 5;
        else if (xp >= 600) nivel = 4;
        else if (xp >= 300) nivel = 3;
        else if (xp >= 100) nivel = 2;
        
        this.memoria.evolucion.nivelActual = nivel;
        console.log(`🎯 Nivel: ${nivel} - ${this.preguntasPorNivel[`nivel${nivel}`]?.nombre || "Aprendiz"}`);
    }
    
    ganarXP(cantidad, motivo) {
        this.memoria.evolucion.xpTotal += cantidad;
        console.log(`📈 +${cantidad} XP (${motivo}) | Total: ${this.memoria.evolucion.xpTotal} XP`);
        this.guardarTodo();
        
        // Verificar subida de nivel
        const nuevoNivel = this.calcularNivelPorXP(this.memoria.evolucion.xpTotal);
        if (nuevoNivel > this.memoria.evolucion.nivelActual) {
            this.memoria.evolucion.nivelActual = nuevoNivel;
            console.log(`🎉 ¡FELICIDADES! Subiste al NIVEL ${nuevoNivel} - ${this.preguntasPorNivel[`nivel${nuevoNivel}`]?.nombre || "Explorador"} 🎉`);
        }
    }
    
    calcularNivelPorXP(xp) {
        if (xp >= 1000) return 5;
        if (xp >= 600) return 4;
        if (xp >= 300) return 3;
        if (xp >= 100) return 2;
        return 1;
    }
    
    // ==================== MÉTODO PRINCIPAL ====================
    
    async preguntar(texto) {
        this.cargarTodosLosDatos();
        
        // ==================== 1. DETECTAR MÚSICA (con inteligencia, NO solo "pon") ====================
        const musicaDetectada = this.detectarMusicaInteligente(texto);
        
        if (musicaDetectada.esMusica) {
            console.log(`🎵 COMANDO DE MÚSICA DETECTADO: ${musicaDetectada.categoria || 'sin categoría'} - Texto: "${texto}"`);
            
            if (musicaDetectada.categoria) {
                this.reproducirMusica(musicaDetectada.categoria);
                
                const respuestas = {
                    concentracion: `🎵 ¡Perfecto, ${this.usuario.nombre}! Poniendo música para concentración y estudio. 📚🎧`,
                    dormir: `🎵 ¡Claro, ${this.usuario.nombre}! Poniendo música relajante para dormir. 🌙😴`,
                    meditar: `🎵 ¡Excelente, ${this.usuario.nombre}! Poniendo música para meditar y encontrar paz interior. 🧘🎧`,
                    motivacion: `🎵 ¡Vamos, ${this.usuario.nombre}! Poniendo música motivacional para darlo todo. 💪🎧`
                };
                
                const respuestaTexto = respuestas[musicaDetectada.categoria] || `🎵 Reproduciendo música, ${this.usuario.nombre}. ¡Disfrútala! 🎧`;
                
                await this.aprender(Date.now(), texto, respuestaTexto, "positivo", null);
                
                return {
                    texto: respuestaTexto,
                    emocion: "positivo",
                    tipoRespuesta: "musica",
                    confianza: 0.99,
                    accionRealizada: "reproducir_musica",
                    datosContexto: this.obtenerResumenCompleto(),
                    aprendizaje: { nivel: this.memoria.evolucion.nivelActual, xp: this.memoria.evolucion.xpTotal }
                };
            } else {
                const respuesta = `🎵 ¿Qué tipo de música quieres escuchar, ${this.usuario.nombre}? Tengo para: concentración 📚 (estudio/trabajo), dormir 😴 (relajación/lluvia), meditar 🧘 (zen/calma) o motivación 💪 (energía/positiva).`;
                await this.aprender(Date.now(), texto, respuesta, "neutral", null);
                return {
                    texto: respuesta,
                    emocion: "neutral",
                    tipoRespuesta: "musica",
                    confianza: 0.95,
                    datosContexto: this.obtenerResumenCompleto(),
                    aprendizaje: { nivel: this.memoria.evolucion.nivelActual, xp: this.memoria.evolucion.xpTotal }
                };
            }
        }
        
        // ==================== 2. DETECTAR INTENCIÓN CON VOCABULARIO COMPLETO ====================
        const intencion = this.detectarIntencion(texto);
        
        // ==================== 3. PROCESAR SEGÚN INTENCIÓN ====================
        
        // CRISIS (máxima prioridad)
        if (intencion.intencion === "crisis_ayuda" || texto.toLowerCase().includes("crisis") || texto.toLowerCase().includes("emergencia") || 
            texto.toLowerCase().includes("no estoy bien") || texto.toLowerCase().includes("ayuda")) {
            const respuestaCrisis = await this.responderCrisis(texto);
            if (respuestaCrisis) {
                await this.aprender(Date.now(), texto, respuestaCrisis.texto, "triste", null);
                return respuestaCrisis;
            }
        }
        
        // METAS
        if (intencion.intencion === "consultar_metas" || texto.toLowerCase().includes("mis metas") || texto.toLowerCase().includes("revisa metas")) {
            const respuestaMetas = await this.responderConsultaMetas();
            if (respuestaMetas) {
                await this.aprender(Date.now(), texto, respuestaMetas.texto, "positivo", null);
                return respuestaMetas;
            }
        }
        
        // PROGRESO GENERAL
        if (intencion.intencion === "consultar_progreso" || texto.toLowerCase().includes("mi progreso") || texto.toLowerCase().includes("cómo voy")) {
            const respuestaProgreso = await this.responderConsultaProgreso();
            if (respuestaProgreso) {
                await this.aprender(Date.now(), texto, respuestaProgreso.texto, "positivo", null);
                return respuestaProgreso;
            }
        }
        
        // HÁBITOS
        if (intencion.intencion === "consultar_habitos" || texto.toLowerCase().includes("mis hábitos") || texto.toLowerCase().includes("mis habitos")) {
            const respuestaHabitos = await this.responderConsultaHabitos();
            if (respuestaHabitos) {
                await this.aprender(Date.now(), texto, respuestaHabitos.texto, "neutral", null);
                return respuestaHabitos;
            }
        }
        
        // EJERCICIOS
        if (intencion.intencion === "consultar_ejercicios" || texto.toLowerCase().includes("mis ejercicios") || texto.toLowerCase().includes("cuánto he entrenado")) {
            const respuestaEjercicios = await this.responderConsultaEjercicios();
            if (respuestaEjercicios) {
                await this.aprender(Date.now(), texto, respuestaEjercicios.texto, "positivo", null);
                return respuestaEjercicios;
            }
        }
        
        // SUEÑO
        if (intencion.intencion === "consultar_sueno" || texto.toLowerCase().includes("mi sueño") || texto.toLowerCase().includes("cómo he dormido")) {
            const respuestaSueno = await this.responderConsultaSueno();
            if (respuestaSueno) {
                await this.aprender(Date.now(), texto, respuestaSueno.texto, "neutral", null);
                return respuestaSueno;
            }
        }
        
        // LOGROS
        if (intencion.intencion === "consultar_logros" || texto.toLowerCase().includes("mis logros") || texto.toLowerCase().includes("mis medallas")) {
            const respuestaLogros = await this.responderConsultaLogros();
            if (respuestaLogros) {
                await this.aprender(Date.now(), texto, respuestaLogros.texto, "positivo", null);
                return respuestaLogros;
            }
        }
        
        // COMUNIDAD
        if (intencion.intencion === "consultar_comunidad" || texto.toLowerCase().includes("comunidad")) {
            const respuestaComunidad = await this.responderConsultaComunidad();
            if (respuestaComunidad) {
                await this.aprender(Date.now(), texto, respuestaComunidad.texto, "neutral", null);
                return respuestaComunidad;
            }
        }
        
        // BIBLIOTECA
        if (intencion.intencion === "consultar_biblioteca" || texto.toLowerCase().includes("mis libros") || texto.toLowerCase().includes("biblioteca")) {
            const respuestaBiblioteca = await this.responderConsultaBiblioteca();
            if (respuestaBiblioteca) {
                await this.aprender(Date.now(), texto, respuestaBiblioteca.texto, "neutral", null);
                return respuestaBiblioteca;
            }
        }
        
        // MAPAS
        if (intencion.intencion === "consultar_mapas" || texto.toLowerCase().includes("mapas mentales") || texto.toLowerCase().includes("mis mapas")) {
            const respuestaMapas = await this.responderConsultaMapas();
            if (respuestaMapas) {
                await this.aprender(Date.now(), texto, respuestaMapas.texto, "neutral", null);
                return respuestaMapas;
            }
        }
        
        // PLUGINS
        if (intencion.intencion === "gestionar_plugins" || texto.toLowerCase().includes("plugins") || texto.toLowerCase().includes("tienda")) {
            const respuestaPlugins = await this.responderConsultaPlugins();
            if (respuestaPlugins) {
                await this.aprender(Date.now(), texto, respuestaPlugins.texto, "neutral", null);
                return respuestaPlugins;
            }
        }
        
        // CUESTIONARIOS
        if (intencion.intencion === "consultar_cuestionarios" || texto.toLowerCase().includes("cuestionarios") || texto.toLowerCase().includes("test de")) {
            const respuestaCuestionarios = await this.responderConsultaCuestionarios();
            if (respuestaCuestionarios) {
                await this.aprender(Date.now(), texto, respuestaCuestionarios.texto, "neutral", null);
                return respuestaCuestionarios;
            }
        }
        
        // BIENESTAR EMOCIONAL
        const respuestaEmocional = await this.responderBienestarEmocional(texto, null);
        if (respuestaEmocional) {
            await this.aprender(Date.now(), texto, respuestaEmocional.texto, respuestaEmocional.emocion, null);
            return respuestaEmocional;
        }
        
        // PERFIL
        if (intencion.intencion === "consultar_perfil" || texto.toLowerCase().includes("mi perfil") || texto.toLowerCase().includes("quién soy")) {
            const respuestaPerfil = await this.responderPerfil();
            if (respuestaPerfil) {
                await this.aprender(Date.now(), texto, respuestaPerfil.texto, "neutral", null);
                return respuestaPerfil;
            }
        }
        
        // AYUDA
        if (intencion.intencion === "ayuda" || texto.toLowerCase().includes("qué puedes hacer") || texto.toLowerCase().includes("ayuda") || texto.toLowerCase().includes("cómo funcionas")) {
            const respuestaAyuda = await this.responderAyuda();
            if (respuestaAyuda) {
                await this.aprender(Date.now(), texto, respuestaAyuda.texto, "neutral", null);
                return respuestaAyuda;
            }
        }
        
        // ==================== 4. PROCESAR ACCIONES (crear, actualizar, completar) ====================
        const accionResultado = await this.procesarConAcciones(texto);
        if (accionResultado) {
            await this.aprender(Date.now(), texto, accionResultado.texto, accionResultado.emocion, null);
            return accionResultado;
        }
        
        // ==================== 5. PROGRAMACIÓN ====================
        if (intencion.intencion === "programacion" || texto.toLowerCase().includes("código") || texto.toLowerCase().includes("programar")) {
            const resultado = this.aprendizaje.consultarProgramacion(texto);
            if (resultado && resultado.codigo) {
                const nombreLenguaje = { java: "Java", javascript: "JavaScript", python: "Python" }[resultado.lenguaje] || resultado.lenguaje;
                let mensaje = `💻 **${nombreLenguaje} - ${resultado.tema}**\n\n📝 **Ejemplo de código:**\n\`\`\`${resultado.lenguaje}\n${resultado.codigo}\n\`\`\`\n💡 ¿Necesitas más ejemplos, ${this.usuario.nombre}?`;
                this.ganarXP(5, "Programación");
                await this.aprender(Date.now(), texto, mensaje, "neutral", null);
                return {
                    texto: mensaje,
                    emocion: "neutral",
                    tipoRespuesta: "programacion",
                    confianza: 0.95,
                    datosContexto: this.obtenerResumenCompleto()
                };
            }
        }
        
        // ==================== 6. SALUDOS ====================
        const textoLower = texto.toLowerCase();
        const saludosSimples = ["hola", "buenos días", "buenas tardes", "buenas noches", "hey", "qué tal", "saludos"];
        const esSaludoSimple = saludosSimples.some(s => textoLower.trim() === s || textoLower.trim().startsWith(s + " "));
        
        if (esSaludoSimple) {
            const saludos = [
                `✨ ¡Hola, ${this.usuario.nombre}! ¿Cómo estás hoy?`,
                `👋 ¡Hey, ${this.usuario.nombre}! ¿Qué tal va todo?`,
                `🌟 ¡Buenas, ${this.usuario.nombre}! ¿En qué puedo ayudarte?`,
                `💫 ¡Hola de nuevo, ${this.usuario.nombre}! ¿Cómo va tu día?`
            ];
            this.ganarXP(1, "Saludo");
            const respuesta = saludos[Math.floor(Math.random() * saludos.length)];
            await this.aprender(Date.now(), texto, respuesta, "positivo", null);
            return {
                texto: respuesta,
                emocion: "positivo",
                tipoRespuesta: "saludo",
                confianza: 0.98,
                datosContexto: this.obtenerResumenCompleto()
            };
        }
        
        // ==================== 7. USAR GEMINI (si está disponible) ====================
        let respuestaFinal = null;
        
        if (this.gemini.disponible && texto.length > 3) {
            const analisis = this.analizarProfundamente(texto);
            const respuestaGemini = await this.generarConGemini(analisis);
            if (respuestaGemini) {
                respuestaFinal = respuestaGemini;
            }
        }
        
        // ==================== 8. FALLBACK: RESPUESTA SABIA LOCAL ====================
        if (!respuestaFinal) {
            const analisis = this.analizarProfundamente(texto);
            respuestaFinal = await this.respuestaSabia(analisis);
        }
        
        await this.aprender(Date.now(), texto, respuestaFinal.texto, respuestaFinal.emocion || "neutral", null);
        
        return {
            texto: respuestaFinal.texto,
            emocion: respuestaFinal.emocion || "neutral",
            tipoRespuesta: respuestaFinal.tipo || "general",
            confianza: respuestaFinal.confianza || 0.85,
            datosContexto: this.obtenerResumenCompleto(),
            aprendizaje: { nivel: this.memoria.evolucion.nivelActual, xp: this.memoria.evolucion.xpTotal }
        };
    }
    
    async aprender(conversacionId, pregunta, respuesta, emocion, feedback = null) {
        this.memoria.conversaciones.unshift({ id: conversacionId, pregunta, respuesta, emocion, feedback, timestamp: Date.now() });
        if (this.memoria.conversaciones.length > 100) this.memoria.conversaciones.pop();
        
        if (feedback === "positivo") {
            this.memoria.evolucion.feedbackPositivo++;
            this.ganarXP(2, "Feedback positivo");
        }
        
        if (feedback === "positivo") {
            this.aprendizaje.memoria.aciertos++;
            this.aprendizaje.memoria.preguntasRespondidas.unshift({ pregunta, respuesta, feedback, timestamp: Date.now() });
            const palabras = this.aprendizaje.extraerPalabrasClave(pregunta);
            for (let palabra of palabras) this.aprendizaje.aprenderPalabra(palabra, "conversacion");
        } else if (feedback === "negativo") {
            this.aprendizaje.memoria.errores++;
        }
        
        if (this.aprendizaje.memoria.preguntasRespondidas.length > 100) this.aprendizaje.memoria.preguntasRespondidas.pop();
        this.aprendizaje.guardar();
        
        this.memoria.evolucion.totalInteracciones++;
        this.ganarXP(1, "Interacción");
        this.guardarTodo();
    }
    
    limpiarRespuesta(texto) {
        if (!texto) return "";
        return texto.replace(/\*\*|\*|__|_|`/g, "").replace(/\s+/g, " ").trim();
    }
    
    cargarTodo() {
        try {
            const guardado = localStorage.getItem("reprompt_aprendizaje_v24");
            if (guardado) {
                const data = JSON.parse(guardado);
                this.memoria = { ...this.memoria, ...data.memoria };
                this.usuario = { ...this.usuario, ...data.usuario };
            }
        } catch(e) {}
        
        const infoGuardada = localStorage.getItem("reprompt_usuario_info");
        if (infoGuardada) {
            try {
                const info = JSON.parse(infoGuardada);
                this.memoria.informacionUsuario = info;
                if (info.nombre && info.nombre !== "Usuario") {
                    this.usuario.nombre = info.nombre;
                }
            } catch(e) {}
        }
    }
    
    guardarTodo() {
        localStorage.setItem("reprompt_aprendizaje_v24", JSON.stringify({
            memoria: this.memoria,
            usuario: this.usuario
        }));
        this.guardarInformacionUsuario();
        this.aprendizaje.guardar();
    }
    
    cargarDatosReprompt() {
        try {
            const metas = JSON.parse(localStorage.getItem("metas_proyectos_v6") || "[]");
            this.datos.metas.activas = metas.filter(m => !m.completado);
            this.datos.metas.completadas = metas.filter(m => m.completado).length;
        } catch(e) {}
        
        try {
            const perfil = JSON.parse(localStorage.getItem("reprompt_perfil_v6") || "{}");
            this.usuario.nombre = perfil.nombre || "Usuario";
        } catch(e) {}
    }
    
    inicializarOrganizacionDiaria() {
        const hoy = new Date().toISOString().split('T')[0];
        if (this.organizacion.hoy.fecha !== hoy) {
            this.organizacion.hoy = { fecha: hoy, intencion: null, prioridades: [], completadas: [], aprendizaje: null, gratitud: null };
            this.guardarOrganizacion();
        }
    }
    
    guardarOrganizacion() {
        localStorage.setItem("reprompt_organizacion_v24", JSON.stringify(this.organizacion));
    }
    
    cargarOrganizacion() {
        try {
            const guardado = localStorage.getItem("reprompt_organizacion_v24");
            if (guardado) this.organizacion = JSON.parse(guardado);
        } catch(e) {}
        this.inicializarOrganizacionDiaria();
    }
    
    detectarArquetipo() {
        this.usuario.arquetipo = "buscador";
    }
    
    establecerIntencion(intencion) {
        this.organizacion.hoy.intencion = intencion;
        this.guardarOrganizacion();
        this.ganarXP(5, "Intención");
        return `✨ Intención registrada, ${this.usuario.nombre}: "${intencion}"`;
    }
    
    agregarPrioridad(tarea) {
        this.organizacion.hoy.prioridades.push({ tarea, completada: false });
        this.guardarOrganizacion();
        this.ganarXP(3, "Prioridad");
        return `✅ Agregada, ${this.usuario.nombre}: "${tarea}"`;
    }
    
    completarTarea(tarea) {
        const prioridad = this.organizacion.hoy.prioridades.find(p => p.tarea.toLowerCase().includes(tarea.toLowerCase()));
        if (prioridad && !prioridad.completada) {
            prioridad.completada = true;
            this.organizacion.hoy.completadas.push(prioridad.tarea);
            this.guardarOrganizacion();
            this.ganarXP(10, "Tarea completada");
            return `🎉 ¡Felicidades, ${this.usuario.nombre}! Completaste "${prioridad.tarea}". ¡Qué orgullo!`;
        }
        return null;
    }
    
    obtenerResumenDia() {
        const hoy = this.organizacion.hoy;
        let resumen = `📅 **Resumen de tu día, ${this.usuario.nombre}:**\n\n`;
        if (hoy.intencion) resumen += `🎯 Intención: "${hoy.intencion}"\n`;
        if (hoy.completadas.length) resumen += `✅ Completaste: ${hoy.completadas.length} ${hoy.completadas.length === 1 ? 'tarea' : 'tareas'}\n`;
        if (hoy.prioridades.length > 0) {
            const pendientes = hoy.prioridades.filter(p => !p.completada);
            if (pendientes.length) resumen += `⏳ Pendientes: ${pendientes.length}\n`;
        }
        resumen += `\n🎯 Nivel ${this.memoria.evolucion.nivelActual} | ✨ ${this.memoria.evolucion.xpTotal} XP`;
        resumen += `\n\n💭 Mañana es una nueva oportunidad para seguir creciendo, ${this.usuario.nombre}.`;
        return resumen;
    }
    
    async registrarFeedback(conversacionId, tipo) {
        const conversacion = this.memoria.conversaciones.find(c => c.id == conversacionId);
        if (conversacion) {
            await this.aprender(conversacionId, conversacion.pregunta, conversacion.respuesta, conversacion.emocion, tipo);
        }
        return { success: true };
    }
    
    obtenerEstado() {
        return {
            version: this.version,
            nivel: this.memoria.evolucion.nivelActual,
            xp: this.memoria.evolucion.xpTotal,
            gemini: { disponible: this.gemini.disponible, modelo: this.gemini.model },
            conversaciones: this.memoria.conversaciones.length,
            usuarioNombre: this.usuario.nombre,
            preguntasRealizadas: this.memoria.preguntasRealizadas.size,
            perfilCargado: !!this.memoria.perfilPsicologico.personalidad,
            aprendizaje: {
                palabras: Object.keys(this.aprendizaje.vocabulario.palabras).length,
                lenguajes: Object.keys(this.aprendizaje.programacion).length,
                aciertos: this.aprendizaje.memoria.aciertos,
                errores: this.aprendizaje.memoria.errores
            }
        };
    }
}

const repromptAI = new RepromptIntelligence();
window.repromptAI = repromptAI;

window.procesarPregunta = async (texto) => repromptAI.preguntar(texto);
window.obtenerEstadoIA = () => repromptAI.obtenerEstado();
window.registrarFeedbackIA = async (id, tipo) => repromptAI.registrarFeedback(id, tipo);
window.establecerIntencion = (intencion) => repromptAI.establecerIntencion(intencion);
window.agregarPrioridad = (tarea) => repromptAI.agregarPrioridad(tarea);
window.completarTarea = (tarea) => repromptAI.completarTarea(tarea);
window.obtenerResumenDia = () => repromptAI.obtenerResumenDia();

window.aprenderNuevaPalabra = (palabra, contexto, sinonimos) => repromptAI.aprendizaje.aprenderPalabra(palabra, contexto, sinonimos || []);
window.aprenderNuevoCodigo = (lenguaje, tema, subtema, codigo) => repromptAI.aprendizaje.aprenderCodigo(lenguaje, tema, subtema, codigo);
window.autoEvaluarIA = () => repromptAI.aprendizaje.autoEvaluar();
window.reproducirMusica = (categoria, busqueda) => repromptAI.reproducirMusica(categoria, busqueda);
window.reproducirAudiolibro = (titulo, autor) => repromptAI.reproducirAudiolibro(titulo, autor);
window.abrirAppMusica = () => repromptAI.abrirAppMusica();

console.log("🧠 REPROMPT Intelligence v36.0.0 - INTELIGENCIA TOTAL - 18 SISTEMAS");
console.log("✨ Con backoff exponencial anti-429");
console.log("🎯 XP: 84 | Nivel 1 - Aprendiz");
console.log("📡 Acceso a 18 sistemas de Reprompt OS");
console.log("💬 Contexto de conversación ACTIVADO");
console.log("⚡ Sistema de acciones activado");
console.log("👤 Reconocimiento de nombre activado");
console.log("📋 Preguntas proactivas para conocer al usuario");
console.log("📊 Perfil psicológico desde cuestionarios");
console.log("💻 Sistema de programación y auto-aprendizaje ACTIVADO");
console.log("🎵 Control de música COMPLETO - Reconoce TODAS las variantes de comandos");
console.log("⏳ Esperando recuperación de la API...");