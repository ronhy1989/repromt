\"\"\"
REPROMPT INTELLIGENCE - VERSIÓN PYTHON 36.0.0
\"INTELIGENCIA TOTAL - 18 SISTEMAS\"
CON BACKOFF EXPONENCIAL PARA 429 Y VOCABULARIO COMPLETO
EJECUTA EN EL NAVEGADOR CON PYODIDE
TODAS LAS FUNCIONALIDADES DEL ORIGINAL PRESERVADAS
\"\"\"

import json
import re
import time
import random
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Set, Tuple
from dataclasses import dataclass, field, asdict
import js

# ==================== CONFIGURACIÓN GEMINI API ====================

class GeminiConfig:
    def __init__(self):
        self.apiKey = "AIzaSyAE866guB-zbjsrOmJ3Lk8a8vrD3P3kWCo"
        self.baseUrl = "https://generativelanguage.googleapis.com/v1beta"
        self.model = "gemini-1.5-flash"
        self.temperature = 0.8
        self.maxTokens = 1000
        self.timeout = 10000
        self.disponible = False
        self.reintentos = 0
        self.maxReintentos = 3
        self.tiempoEsperaBase = 5000

# ==================== MEMORIA Y APRENDIZAJE ====================

class InformacionUsuario:
    def __init__(self):
        self.nombre = None
        self.edad = None
        self.ocupacion = None
        self.hobbies = []
        self.motivaciones = []
        self.miedos = []
        self.fortalezas = []

class PerfilPsicologico:
    def __init__(self):
        self.personalidad = None
        self.inteligenciaEmocional = None
        self.estiloAprendizaje = None
        self.fortalezas = []
        self.mindset = None
        self.proposito = None

class EstadoEmocional:
    def __init__(self):
        self.ultimo = None
        self.historial = []
        self.tendencia = "estable"
        self.patronesDiarios = {}

class Patrones:
    def __init__(self):
        self.temasFavoritos = {}
        self.emocionesComunes = {}
        self.palabrasClave = {}
        self.mejoresRespuestas = {}
        self.estadoEmocional = EstadoEmocional()

class Evolucion:
    def __init__(self):
        self.generacion = 1
        self.nivelSabiduria = 1
        self.totalInteracciones = 0
        self.feedbackPositivo = 0
        self.feedbackNegativo = 0
        self.metasPropuestas = 0
        self.habitosSugeridos = 0
        self.reflexionesGeneradas = 0
        self.momentosInspiracion = 0
        self.xpTotal = 84
        self.nivelActual = 1
        self.nivelMaximoAlcanzado = 1
        self.desbloqueos = {
            "nivel2": False, "nivel3": False, "nivel4": False, "nivel5": False
        }
        self.hitos = {
            "primeras5Interacciones": True,
            "primeras20Interacciones": False,
            "primeras50Interacciones": False,
            "primeras100Interacciones": False,
            "primeraMetaCompletada": False,
            "primerHabitoMantenido": False,
            "racha7Dias": False,
            "racha30Dias": False,
            "feedbackPositivo10": False,
            "feedbackPositivo50": False
        }

class Memoria:
    def __init__(self):
        self.conversaciones = []
        self.respuestasExitosas = []
        self.respuestasFallidas = []
        self.reflexionesProfundas = []
        self.momentosClave = []
        self.preguntasRealizadas = set()
        self.fechaUltimaPregunta = None
        self.ultimaPreguntaActiva = None
        self.ultimoTema = None
        self.informacionUsuario = InformacionUsuario()
        self.perfilPsicologico = PerfilPsicologico()
        self.patrones = Patrones()
        self.evolucion = Evolucion()

# ==================== DATOS DEL USUARIO ====================

class Usuario:
    def __init__(self):
        self.nombre = "Usuario"
        self.nivel = 1
        self.xp = 84
        self.racha = 0
        self.emocionPredominante = "neutral"
        self.arquetipo = "buscador"
        self.valores = []
        self.proposito = None
        self.id = "user_" + str(int(time.time() * 1000))
        self.patronesPersonales = {
            "mejorMomento": "mañana",
            "temasPreferidos": [],
            "palabrasComunes": {}
        }
        self.estadisticas = {
            "metasCompletadasHistorial": 0,
            "habitosMantenidos": 0,
            "diasConsecutivos": 0,
            "reflexionesCompletadas": 0,
            "nivelAlcanzado": 1
        }

# ==================== DATOS DE REPROMPT OS ====================

class DatosReprompt:
    def __init__(self):
        self.metas = {"activas": [], "completadas": 0, "total": 0, "progresoPromedio": 0, "lista": []}
        self.habitos = {"activos": [], "rachaTotal": 0, "mejorRacha": 0, "lista": []}
        self.ejercicios = {"caloriasHoy": 0, "racha": 0, "minutosActivos": 0, "total": 0}
        self.sueno = {"horasAnoche": 0, "calidad": 0, "racha": 0, "promedioSemana": 0}
        self.logros = {"total": 0, "recientes": [], "nivelLogros": 1}
        self.dashboard = {"totalEntradas": 0, "nivel": 1, "racha": 0}
        self.emocional = {"ultimaEmocion": None, "resumen": {}, "historial": []}
        self.profesionales = {"conectados": 0, "proximasCitas": 0}
        self.musica = {"generoFavorito": None, "cancionesFavoritas": 0, "playlistActivas": 0, "ultimaEscuchada": None}
        self.comunidad = {"misPublicaciones": 0, "interaccions": 0, "seguidores": 0}
        self.crisis = {"recursosGuardados": 0, "planSeguridad": False, "ultimoRegistro": None}
        self.cuestionarios = {"totalRealizados": 0, "promedioGeneral": 0, "resultados": {}, "ultimoResultado": None}
        self.biblioteca = {"totalLibros": 0, "leidos": 0, "favoritos": 0, "ultimoAgregado": None}
        self.reportes = {"ultimoReporte": None, "estadisticasSemanales": {}}
        self.mapas = {"total": 0, "ultimoCreado": None, "favoritos": 0}
        self.database = {"ultimaSincronizacion": None, "datosSincronizados": 0}
        self.plugins = {"instalados": 0, "activos": 0, "lista": []}
        self.libroVida = {"totalEntradas": 0, "porTipo": {"texto": 0, "audio": 0, "video": 0, "conversacion": 0}, "ultimaEntrada": None}

# ==================== VOCABULARIO COMPLETO POR INTENCIÓN ====================

VOCABULARIO_INTENCIONES = {
    "consultar_metas": {
        "palabras": ["mis metas", "revisa metas", "cómo van mis metas", "qué metas tengo", "ver metas", "estado de metas", "progreso de metas", "metas actuales", "dime mis metas", "mostrar metas", "lista de metas", "avance de metas", "revisar objetivos", "qué objetivos tengo", "mis propósitos", "qué quiero lograr", "mis proyectos personales", "en qué voy con mis metas", "cuántas metas he completado", "metas pendientes", "metas en progreso", "metas finalizadas", "objetivo principal", "meta del mes", "meta de la semana", "qué me propuse lograr", "cuál es mi norte", "qué estoy construyendo", "mis sueños en proceso", "qué quiero alcanzar", "hacia dónde voy"],
        "peso": 10
    },
    "crear_meta": {
        "palabras": ["crear meta", "nueva meta", "agregar meta", "quiero lograr", "establecer meta", "añadir objetivo", "proponerme", "definir meta", "registrar meta", "guardar meta", "iniciar meta", "empezar meta", "quiero conseguir", "mi meta es", "añadir propósito", "crear propósito", "definir objetivo", "quiero completar", "agregar proyecto", "nuevo propósito", "quiero alcanzar", "deseo lograr", "aspiro a", "me propongo", "voy a lograr", "quiero terminar", "mi objetivo es", "quiero cumplir", "añadir a mis metas", "registrar nuevo objetivo"],
        "peso": 9
    },
    "actualizar_meta": {
        "palabras": ["actualizar meta", "avancé en mi meta", "progreso de meta", "completé mi meta", "terminé mi meta", "logré mi meta", "avance porcentaje", "subir progreso", "aumentar progreso", "voy en porcentaje", "llevo porcentaje", "meta va en porcentaje", "progreso actual", "actualizar avance", "adelanté en mi objetivo", "mejoré en mi meta", "cumplí parcialmente", "estoy a tanto porciento", "mi meta está a tanto", "completé una parte", "terminé una fase", "logré un hito", "superé un paso", "alcancé un avance", "ya casi cumplo", "estoy cerca de lograrlo", "avance significativo", "marcar como completada", "celebrar logro"],
        "peso": 9
    },
    "consultar_progreso": {
        "palabras": ["mi progreso", "cómo voy", "qué he logrado", "estadísticas generales", "mi avance", "mi nivel", "cuánta XP tengo", "mi racha", "resumen de progreso", "estado general", "panorama general", "cómo estoy progresando", "qué he conseguido", "cuánto he avanzado", "mi evolución", "mi crecimiento", "mis logros acumulados", "mi desempeño", "mi trayectoria", "qué tanto he mejorado", "mi desarrollo personal", "qué resultados tengo"],
        "peso": 8
    },
    "consultar_habitos": {
        "palabras": ["mis hábitos", "qué hábitos tengo", "revisar hábitos", "lista de hábitos", "estado de hábitos", "racha de hábitos", "hábitos activos", "rutinas diarias", "qué debo hacer hoy", "mis costumbres", "hábitos que estoy construyendo", "qué repito cada día", "mis disciplinas", "compromisos diarios", "rutinas matutinas", "rutinas nocturnas", "hábitos saludables", "qué hago regularmente", "mi consistencia", "mi constancia", "qué estoy practicando"],
        "peso": 7
    },
    "crear_habito": {
        "palabras": ["crear hábito", "nuevo hábito", "agregar hábito", "quiero construir el hábito de", "establecer rutina", "empezar hábito", "registrar hábito", "añadir costumbre", "quiero hacer cada día", "voy a repetir", "disciplina nueva", "rutina nueva", "hábito diario", "hábito semanal", "quiero mantener", "quiero consistencia"],
        "peso": 8
    },
    "completar_habito": {
        "palabras": ["completar hábito", "hice mi hábito", "cumplí con mi hábito", "marcar hábito como hecho", "hoy hice", "ya lo hice", "registra que completé", "terminé mi hábito", "realicé mi rutina", "cumplí hoy", "mi racha sigue", "día completado", "hecho por hoy", "ya cumplí con", "tachar hábito", "confirmar realización"],
        "peso": 8
    },
    "racha_habitos": {
        "palabras": ["racha de hábitos", "cuántos días seguidos", "mi racha actual", "racha más larga", "días consecutivos", "consistencia acumulada", "qué racha tengo", "no he fallado", "días seguidos haciendo", "mi mejor marca"],
        "peso": 6
    },
    "registrar_ejercicio": {
        "palabras": ["registrar ejercicio", "hice ejercicio", "entrené hoy", "actividad física", "cuánto entrené", "minutos de ejercicio", "calorías quemadas", "mi rutina de hoy", "qué deporte hice", "mi entrenamiento", "sesión de hoy", "ejercicio completado", "corrí", "troté", "caminé", "cardio", "pesas", "gimnasio", "yoga", "pilates", "natación", "nadé", "bicicleta", "bici", "spinning", "crossfit", "funcional", "estiramientos", "movilidad", "baile", "dancing", "senderismo", "trekking", "escalada", "calistenia", "abdominales", "flexiones", "sentadillas", "dominadas", "plancha", "burpees", "saltar la cuerda", "zumba", "artes marciales", "boxeo", "kickboxing", "taekwondo", "karate"],
        "peso": 8
    },
    "consultar_ejercicios": {
        "palabras": ["mis ejercicios", "cuánto he entrenado", "estadísticas de ejercicio", "resumen de actividad física", "calorías quemadas totales", "minutos activos totales", "días de entrenamiento", "frecuencia semanal", "mejor marca", "récord personal", "progreso físico"],
        "peso": 6
    },
    "registrar_sueno": {
        "palabras": ["registrar sueño", "dormí horas", "anoche dormí", "mi sueño de anoche", "calidad de sueño", "descansé horas", "mis horas de sueño", "cómo dormí", "cómo descansé", "calidad del descanso", "sueño reparador", "cuánto dormí", "mi descanso nocturno", "horas en cama", "sueño profundo", "me desperté", "me costó dormir", "me levanté cansado", "descansé bien", "descansé mal"],
        "peso": 8
    },
    "consultar_sueno": {
        "palabras": ["mi sueño", "cómo he dormido", "estadísticas de sueño", "promedio de horas", "calidad de sueño promedio", "historial de descanso", "resumen de sueño", "patrón de sueño", "regularidad", "informe de descanso", "calidad promedio", "tendencia de sueño"],
        "peso": 6
    },
    "reproducir_musica": {
        "palabras": ["pon música", "reproduce música", "quiero escuchar", "activa música", "enciende música", "poner canción", "reproducir canción", "escuchar audio", "iniciar música", "comenzar música", "que suene música", "quiero audio", "pon algo de música", "necesito música", "quiero fondo musical", "música para concentrarme", "música de estudio", "música para trabajar", "música clásica", "lofi", "música de oficina", "música para leer", "música para programar", "sonidos de enfoque", "música productiva", "música para dormir", "música relajante", "sonido de lluvia", "ruido blanco", "música de sueño", "melodía para descansar", "frecuencias para dormir", "música nocturna", "sonidos de naturaleza", "música para meditar", "sonidos de meditación", "música zen", "música de calma", "melodía mindfulness", "sonidos de paz", "música espiritual", "frecuencias de sanación", "música motivacional", "música alegre", "música feliz", "música para entrenar", "música con energía", "rock motivador", "música positiva", "canciones que animen"],
        "peso": 7
    },
    "control_musica": {
        "palabras": ["sube volumen", "baja volumen", "volumen al", "silencio", "mute", "pausa", "para la música", "siguiente canción", "canción anterior", "repetir", "en bucle", "aleatorio", "modo aleatorio", "playlist", "mi lista de reproducción", "canciones favoritas", "guardar en favoritos"],
        "peso": 7
    },
    "consultar_biblioteca": {
        "palabras": ["mis libros", "qué libros tengo", "biblioteca personal", "libros leídos", "libros por leer", "libros favoritos", "cuántos libros he leído", "lista de pendientes", "próximo a leer", "libro que me cambió", "mi libro favorito", "mejor libro que he leído"],
        "peso": 6
    },
    "agregar_libro": {
        "palabras": ["agregar libro", "nuevo libro", "añadir a biblioteca", "quiero leer", "estoy leyendo", "terminé de leer", "libro terminado", "libro completado"],
        "peso": 7
    },
    "recomendar_libro": {
        "palabras": ["recomendar libro", "qué libro me recomiendas", "recomiéndame algo", "libro sobre motivación", "libro de desarrollo personal", "biografía", "ficción", "no ficción", "ensayo", "poesía", "filosofía", "psicología", "negocios", "finanzas"],
        "peso": 5
    },
    "escuchar_audiolibro": {
        "palabras": ["escuchar audiolibro", "reproducir audiolibro", "quiero oír un libro", "pon el audiolibro", "audiolibro de", "narración", "versión audio", "libro hablado"],
        "peso": 7
    },
    "consultar_logros": {
        "palabras": ["mis logros", "qué medallas tengo", "trofeos obtenidos", "recompensas conseguidas", "qué he desbloqueado", "mis reconocimientos", "logros conseguidos", "insignias obtenidas", "premios ganados", "medallas desbloqueadas", "qué he ganado", "mis trofeos", "colección de logros", "qué he completado", "medalla de oro", "medalla de plata", "medalla de bronce", "insignia especial", "logro secreto", "logro de nivel", "racha conseguida", "desafío completado", "misión terminada", "reto superado"],
        "peso": 6
    },
    "consultar_comunidad": {
        "palabras": ["comunidad", "otros usuarios", "publicaciones", "mi red", "seguidores", "siguiendo", "qué dijo la comunidad", "publicaciones recientes", "mi muro", "notificaciones", "mensajes", "conversaciones", "grupo de apoyo", "retos grupales", "competencia amistosa"],
        "peso": 5
    },
    "publicar_comunidad": {
        "palabras": ["publicar", "compartir", "escribir en comunidad", "compartir mi progreso", "contar mi logro", "pedir consejo", "ayudar a alguien", "comentar", "reaccionar", "dar like", "apoyar", "motivar a otros", "celebrar con otros"],
        "peso": 6
    },
    "crisis_ayuda": {
        "palabras": ["crisis", "emergencia", "no estoy bien", "necesito ayuda", "ayuda urgente", "momento difícil", "estoy mal", "me siento abrumado", "no puedo más", "necesito apoyo", "suicidio", "quiero morir", "no quiero vivir", "daño", "lastimarme", "peligro", "desesperado", "sin salida", "no aguanto", "colapsando", "crisis nerviosa", "ataque de pánico", "ansiedad extrema", "depresión profunda"],
        "peso": 10
    },
    "plan_seguridad": {
        "palabras": ["plan de seguridad", "recursos de emergencia", "líneas de ayuda", "contacto de emergencia", "profesionales disponibles", "ayuda profesional", "terapia", "psicólogo", "psiquiatra", "línea de prevención", "chat de ayuda", "recursos guardados", "ejercicios de respiración", "técnicas de anclaje"],
        "peso": 9
    },
    "consultar_cuestionarios": {
        "palabras": ["cuestionarios", "tests", "evaluaciones", "test de personalidad", "big five", "cinco grandes", "test de inteligencia emocional", "IE", "test de fortalezas", "test de aprendizaje", "test de mindset", "test de propósito", "cuestionario de hábitos", "evaluación de bienestar", "ver resultados", "interpretación de resultados", "historial de tests", "comparar resultados", "evolución en el tiempo"],
        "peso": 6
    },
    "realizar_cuestionario": {
        "palabras": ["responder preguntas", "hacer el test de", "empezar cuestionario", "continuar test", "siguiente pregunta", "responder con"],
        "peso": 7
    },
    "consultar_mapas": {
        "palabras": ["mapa mental", "mapa conceptual", "ver mis mapas", "mapa más reciente", "mapa favorito", "mapa compartido", "mapa en progreso", "borrador de mapa"],
        "peso": 5
    },
    "crear_mapa": {
        "palabras": ["crear mapa", "visualizar ideas", "organizar pensamientos", "conexiones entre ideas", "estructura de pensamiento", "diagrama de ideas", "mi mapa", "mis mapas", "mapa de metas", "mapa de proyecto", "mapa de aprendizaje", "agregar nodo", "conectar ideas", "editar mapa", "compartir mapa", "exportar mapa", "mapa interactivo", "vista gráfica", "reorganizar", "colapsar ramas", "expandir todo"],
        "peso": 6
    },
    "gestionar_plugins": {
        "palabras": ["plugins", "tienda", "instalar", "desinstalar", "comprar", "demo", "probar plugin", "extensiones", "complementos", "funcionalidades extra", "qué plugins hay", "plugins disponibles", "plugins instalados", "plugins activos", "licencia activa", "demo activa", "prueba gratuita"],
        "peso": 5
    },
    "generar_reporte": {
        "palabras": ["reportes", "informes", "resumen semanal", "resumen mensual", "estadísticas detalladas", "mi evolución", "gráficos de progreso", "análisis de datos", "tendencias", "patrones de comportamiento", "informe de productividad", "reporte de hábitos", "generar reporte", "exportar reporte", "descargar como PDF", "enviar por correo", "compartir reporte", "ver tendencias", "ver gráficos", "comparar períodos"],
        "peso": 5
    },
    "respaldo_datos": {
        "palabras": ["respaldo", "sincronización", "guardar datos", "exportar información", "copia de seguridad", "restaurar datos", "migrar información", "recuperar cuenta", "perder datos", "recuperar progreso", "hacer respaldo", "exportar todo", "guardar copia", "sincronizar ahora", "restaurar desde copia", "recuperar datos perdidos", "migrar a otro dispositivo", "vincular cuenta", "iniciar sesión", "cerrar sesión", "última sincronización", "tamaño del respaldo", "fecha del último guardado", "dispositivos vinculados", "almacenamiento usado"],
        "peso": 5
    },
    "ver_dashboard": {
        "palabras": ["panel principal", "inicio", "vista general", "resumen rápido", "qué hay de nuevo", "mi espacio", "página principal", "ver todo de un vistazo", "panorama general", "estado actual", "ir al inicio", "mostrar panel", "ver resumen", "mi día hoy", "qué me espera", "estado general", "qué falta por hacer", "vista rápida", "tarjetas de progreso"],
        "peso": 6
    },
    "bienestar_emocional": {
        "palabras": ["bienestar emocional", "salud mental", "estado de ánimo", "regulación emocional", "inteligencia emocional", "manejo de emociones", "cómo gestionar mis sentimientos", "registrar emoción", "cómo me siento", "mi estado emocional hoy", "tracking de ánimo", "diario emocional", "qué siento ahora", "identificar emoción", "validar sentimiento", "aceptar lo que siento"],
        "peso": 7
    },
    "emociones_especificas": {
        "palabras": ["alegría", "felicidad", "tristeza", "enojo", "ira", "frustración", "ansiedad", "nerviosismo", "miedo", "terror", "calma", "tranquilidad", "paz", "serenidad", "motivación", "entusiasmo", "aburrimiento", "apatía", "gratitud", "aprecio", "amor", "cariño", "soledad", "vacío", "esperanza", "optimismo", "pesimismo", "confianza", "inseguridad", "orgullo", "vergüenza", "culpa", "remordimiento"],
        "peso": 7
    },
    "consultar_perfil": {
        "palabras": ["mi perfil", "quién soy", "mis datos", "información personal", "editar perfil", "cambiar nombre", "mi arquetipo", "personalidad", "fortalezas", "valores", "propósito de vida", "quién soy según REPROMPT", "describe mi perfil", "cuál es mi propósito", "cuáles son mis valores", "qué me define", "mi identidad", "mi esencia"],
        "peso": 6
    },
    "actualizar_perfil": {
        "palabras": ["editar perfil", "cambiar mi", "actualizar mi información", "mi edad es", "mi ocupación es", "vivo en", "mi hobby es", "me apasiona", "mi mayor fortaleza es", "mi miedo es", "mi sueño es"],
        "peso": 7
    },
    "aprendizaje_ia": {
        "palabras": ["aprendizaje", "autoaprendizaje", "qué has aprendido de mí", "cómo funciona tu inteligencia", "cómo aprendes", "palabras nuevas", "código nuevo", "programación", "enseñarme algo", "quiero aprender sobre", "qué sabes de mí", "qué recuerdas", "qué has guardado sobre mí", "qué palabras has aprendido", "qué código has memorizado", "evalúa mi progreso", "retroalimentación de mi aprendizaje"],
        "peso": 5
    },
    "programacion": {
        "palabras": ["java", "javascript", "python", "html", "css", "sql", "c++", "c#", "ruby", "go", "rust", "swift", "kotlin", "php", "typescript", "variables", "funciones", "condicionales", "bucles", "arrays", "objetos", "clases", "herencia", "métodos", "librerías", "apis", "frameworks", "sintaxis", "ejemplos", "tutoriales", "ejercicios"],
        "peso": 6
    },
    "preguntar_nombre": {
        "palabras": ["cómo me llamo", "sabes mi nombre", "cuál es mi nombre", "dime mi nombre", "recuerdas mi nombre"],
        "peso": 9
    },
    "decir_nombre": {
        "palabras": ["mi nombre es", "me llamo", "soy", "puedes llamarme"],
        "peso": 9
    },
    "ayuda": {
        "palabras": ["qué puedes hacer", "cómo funcionas", "qué comandos tienes", "ayuda", "qué puedo preguntarte", "cómo usarte", "explicación", "tutorial", "guía", "qué sabes hacer", "cuáles son tus funciones", "qué te puedo pedir", "dime tus capacidades", "cómo interactúo contigo"],
        "peso": 8
    },
    "saludo": {
        "palabras": ["hola", "buenos días", "buenas tardes", "buenas noches", "hey", "qué tal", "saludos"],
        "peso": 5
    },
    "agradecimiento": {
        "palabras": ["gracias", "muchas gracias", "te agradezco", "gracias por todo", "muy bien", "excelente", "perfecto", "genial", "fantástico"],
        "peso": 5
    }
}

# ==================== PREGUNTAS PROACTIVAS ====================

PREGUNTAS_PROACTIVAS = {
    "basico": [
        "¿Qué es lo que más te apasiona en la vida?",
        "¿Cuál es tu mayor fortaleza?",
        "¿Qué habilidad te gustaría desarrollar?",
        "¿Qué te motiva a levantarte cada día?",
        "¿Qué significa para ti el éxito?"
    ],
    "profundo": [
        "¿Qué miedo te gustaría superar?",
        "¿Qué cambiarías de tu vida si pudieras?",
        "¿Cuándo fue la última vez que te sentiste realmente vivo?",
        "¿Qué persona ha influido más en tu vida?",
        "¿Qué te gustaría que recordaran de ti?"
    ],
    "contexto": [
        "¿Cómo es un día típico en tu vida?",
        "¿Qué te ayuda a recargar energías?",
        "¿Qué te causa más estrés actualmente?",
        "¿Qué te hace sentir agradecido?",
        "¿Qué sueño te gustaría cumplir este año?"
    ]
}

# ==================== ORGANIZACIÓN DIARIA ====================

class OrganizacionDiaria:
    def __init__(self):
        self.hoy = {
            "fecha": None,
            "intencion": None,
            "prioridades": [],
            "completadas": [],
            "aprendizaje": None,
            "gratitud": None,
            "energia": 0,
            "estadoAnimo": None,
            "reflexionDelDia": None
        }

# ==================== PREGUNTAS POR NIVEL ====================

PREGUNTAS_POR_NIVEL = {
    "nivel1": {"nombre": "Aprendiz", "xpRequerido": 0},
    "nivel2": {"nombre": "Explorador", "xpRequerido": 100},
    "nivel3": {"nombre": "Buscador", "xpRequerido": 300},
    "nivel4": {"nombre": "Sabio", "xpRequerido": 600},
    "nivel5": {"nombre": "Maestro", "xpRequerido": 1000}
}

# ==================== BASE DE CONOCIMIENTO ====================

PREGUNTAS_FILOSOFICAS = {
    "existencia": [
        "🌌 ¿Cuál es el propósito de tu existencia en este momento?",
        "🌀 ¿Qué huella quieres dejar en el mundo?",
        "🌟 ¿Qué significa para ti vivir una vida plena?"
    ],
    "conciencia": [
        "🧠 ¿Quién eres realmente más allá de tu nombre?",
        "🔍 ¿Qué parte de ti no conoces todavía?"
    ],
    "libertad": [
        "🕊️ ¿Qué te ata y qué te libera?",
        "🔓 ¿Qué creencias limitantes te gustaría soltar?"
    ],
    "felicidad": [
        "😊 ¿Qué es la felicidad para ti?",
        "💖 ¿Cuándo fue la última vez que te sentiste plenamente feliz?"
    ]
}

PENSAMIENTOS_SABIOS = [
    "🏛️ Marco Aurelio: 'Tienes poder sobre tu mente, no sobre los eventos.'",
    "🎭 Séneca: 'No sufrimos por lo que nos pasa, sino por cómo interpretamos lo que nos pasa.'",
    "🍃 Buda: 'La mente lo es todo. En lo que piensas, te conviertes.'",
    "🌙 Lao Tsé: 'Un viaje de mil millas comienza con un solo paso.'"
]

FRASES_MOTIVACION = [
    "🚀 Tu único límite es el que te pones.",
    "💪 El fracaso no es caer, es no levantarse.",
    "🌟 Lo que sembrarás hoy, cosecharás mañana.",
    "✨ Cree en ti, aunque nadie más lo haga."
]

METAFORAS = [
    "🌱 Eres como una semilla: dentro de ti está el árbol que puedes llegar a ser.",
    "🌊 Eres como el océano: calmo en la superficie, profundo en el interior."
]

AFIRMACIONES = [
    "💪 Soy capaz de lograr lo que me propongo.",
    "✨ Merezco amor, respeto y felicidad.",
    "🌟 Cada día soy una mejor versión de mí."
]

PREGUNTAS_COACHING = {
    "vision": ["🎯 ¿Dónde te ves en 5 años?", "🏔️ ¿Qué montaña quieres conquistar?"],
    "valores": ["💎 ¿Qué valores guían tu vida?", "⚖️ ¿Qué es innegociable para ti?"]
}

# ==================== SISTEMA DE AUTO-APRENDIZAJE ====================

class Aprendizaje:
    def __init__(self):
        self.vocabulario = {"palabras": {}, "frasesHechas": [], "patrones": []}
        self.codigo = {"lenguajes": {}, "snippets": []}
        self.memoria = {"aciertos": 0, "errores": 0, "ultimoFeedback": None, "temasAprendidos": [], "preguntasRespondidas": []}
        self.programacion = {
            "java": {
                "sintaxis": {
                    "holaMundo": 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hola Mundo");\n    }\n}',
                    "variables": 'int numero = 10;\nString texto = "Hola";'
                },
                "condicionales": {"if": 'if (condicion) {\n    // código\n} else {\n    // código\n}'},
                "bucles": {"for": 'for (int i = 0; i < 10; i++) {\n    System.out.println(i);\n}', "while": 'while (condicion) {\n    // código\n}'}
            },
            "javascript": {
                "sintaxis": {
                    "holaMundo": 'console.log("Hola Mundo");',
                    "variables": 'let numero = 10;\nconst texto = "Hola";'
                },
                "condicionales": {"if": 'if (condicion) {\n    // código\n} else {\n    // código\n}'},
                "bucles": {"for": 'for (let i = 0; i < 10; i++) {\n    console.log(i);\n}', "forEach": 'array.forEach(elemento => {\n    console.log(elemento);\n});'},
                "funciones": {"declaracion": 'function sumar(a, b) {\n    return a + b;\n}', "arrow": 'const sumar = (a, b) => a + b;'}
            },
            "python": {
                "sintaxis": {"holaMundo": 'print("Hola Mundo")', "variables": 'numero = 10\ntexto = "Hola"'},
                "condicionales": {"if": 'if condicion:\n    # código\nelse:\n    # código'},
                "bucles": {"for": 'for i in range(10):\n    print(i)', "while": 'while condicion:\n    # código'}
            }
        }
        self._cargar()
    
    def _cargar(self):
        try:
            guardado = js.localStorage.getItem("reprompt_aprendizaje_ia")
            if guardado:
                data = json.loads(guardado)
                if "vocabulario" in data:
                    self.vocabulario = data["vocabulario"]
                if "memoria" in data:
                    self.memoria["aciertos"] = data["memoria"].get("aciertos", 0)
                    self.memoria["errores"] = data["memoria"].get("errores", 0)
                    self.memoria["preguntasRespondidas"] = data["memoria"].get("preguntasRespondidas", [])
                if "programacion" in data:
                    self.programacion = data["programacion"]
        except Exception as e:
            pass
    
    def guardar(self):
        try:
            js.localStorage.setItem("reprompt_aprendizaje_ia", json.dumps({
                "vocabulario": self.vocabulario,
                "codigo": self.codigo,
                "memoria": self.memoria,
                "programacion": self.programacion
            }))
        except Exception as e:
            pass
    
    def aprenderPalabra(self, palabra, contexto, sinonimos=None):
        sinonimos = sinonimos or []
        palabraLower = palabra.lower()
        if palabraLower not in self.vocabulario["palabras"]:
            self.vocabulario["palabras"][palabraLower] = {
                "sinonimos": sinonimos,
                "frecuencia": 1,
                "ultimoUso": int(time.time() * 1000),
                "contextos": [contexto]
            }
            print(f"📖 IA aprendió: '{palabra}'")
        else:
            self.vocabulario["palabras"][palabraLower]["frecuencia"] += 1
        self.guardar()
    
    def aprenderCodigo(self, lenguaje, tema, subtema, codigo):
        if lenguaje not in self.programacion:
            self.programacion[lenguaje] = {}
        if tema not in self.programacion[lenguaje]:
            self.programacion[lenguaje][tema] = {}
        self.programacion[lenguaje][tema][subtema] = codigo
        self.guardar()
        print(f"💻 IA aprendió código: {lenguaje}.{tema}.{subtema}")
    
    def buscarRespuestaSimilar(self, pregunta):
        palabrasPregunta = self._extraerPalabrasClave(pregunta)
        if not palabrasPregunta:
            return None
        for r in self.memoria["preguntasRespondidas"]:
            if r.get("feedback") == "positivo":
                palabrasRespuesta = self._extraerPalabrasClave(r.get("pregunta", ""))
                coincidencias = [p for p in palabrasPregunta if p in palabrasRespuesta]
                if len(coincidencias) >= len(palabrasPregunta) * 0.6:
                    return {"respuesta": r.get("respuesta", ""), "confianza": len(coincidencias) / len(palabrasPregunta)}
        return None
    
    def consultarProgramacion(self, pregunta):
        preguntaLower = pregunta.lower()
        lenguaje = None
        tema = None
        subtema = None
        
        if "java" in preguntaLower and "javascript" not in preguntaLower:
            lenguaje = "java"
        elif "javascript" in preguntaLower or "js" in preguntaLower:
            lenguaje = "javascript"
        elif "python" in preguntaLower:
            lenguaje = "python"
        
        if not lenguaje:
            return None
        
        if "hola mundo" in preguntaLower:
            tema = "sintaxis"
            subtema = "holaMundo"
        elif "variable" in preguntaLower:
            tema = "sintaxis"
            subtema = "variables"
        elif "if" in preguntaLower or "else" in preguntaLower:
            tema = "condicionales"
            subtema = "if"
        elif "for" in preguntaLower:
            tema = "bucles"
            subtema = "for"
        elif "while" in preguntaLower:
            tema = "bucles"
            subtema = "while"
        elif "función" in preguntaLower or "funcion" in preguntaLower:
            tema = "funciones"
            subtema = "declaracion"
        
        if tema and subtema and lenguaje in self.programacion and tema in self.programacion[lenguaje] and subtema in self.programacion[lenguaje][tema]:
            return {
                "lenguaje": lenguaje,
                "tema": tema,
                "subtema": subtema,
                "codigo": self.programacion[lenguaje][tema][subtema]
            }
        return None
    
    def _extraerPalabrasClave(self, texto):
        palabras = re.findall(r'\\b[a-záéíóúñ]{4,}\\b', texto.lower())
        comunes = ["como", "cuando", "donde", "porque", "para", "que", "con", "sin", "sobre", "este", "esta", "esto", "estos", "estas"]
        return list(set([p for p in palabras if p not in comunes and len(p) > 3]))
    
    def autoEvaluar(self):
        total = self.memoria["aciertos"] + self.memoria["errores"]
        precision = (self.memoria["aciertos"] / total * 100) if total > 0 else 0
        print(f"📊 Auto-evaluación IA: {precision:.1f}%")
        return {"aciertos": self.memoria["aciertos"], "errores": self.memoria["errores"], "precision": precision}

# ==================== CLASE PRINCIPAL ====================

class RepromptIntelligence:
    def __init__(self):
        self.version = "36.0.0"
        
        # Configuración Gemini API
        self.gemini = GeminiConfig()
        self.openai = {"disponible": False}
        
        # Memoria
        self.memoria = Memoria()
        
        # Usuario
        self.usuario = Usuario()
        
        # Datos de REPROMPT OS (18 sistemas)
        self.datos = DatosReprompt()
        
        # Vocabulario de intenciones
        self.vocabularioIntenciones = VOCABULARIO_INTENCIONES
        
        # Preguntas proactivas
        self.preguntasProactivas = PREGUNTAS_PROACTIVAS
        
        # Organización diaria
        self.organizacion = OrganizacionDiaria()
        
        # Sistema de auto-aprendizaje
        self.aprendizaje = Aprendizaje()
        
        # Inicializar
        self.inicializar()
        self.inicializarOrganizacionDiaria()
        self.verificarGeminiConReintento()
        self.cargarPerfilCuestionarios()
        self.cargarInformacionUsuario()
    
    # ==================== DETECTOR DE INTENCIONES ====================
    
    def detectarIntencion(self, texto):
        textoLower = texto.lower()
        mejorIntencion = None
        mejorPuntaje = 0
        todasCoincidencias = []
        
        for intencion, config in self.vocabularioIntenciones.items():
            puntaje = 0
            palabrasCoincidentes = []
            
            for palabra in config["palabras"]:
                if palabra.lower() in textoLower:
                    puntaje += config["peso"]
                    palabrasCoincidentes.append(palabra)
            
            if self.memoria.ultimoTema == intencion and puntaje > 0:
                puntaje += 3
            
            if puntaje > 0:
                todasCoincidencias.append({"intencion": intencion, "puntaje": puntaje, "palabras": palabrasCoincidentes})
                if puntaje > mejorPuntaje:
                    mejorPuntaje = puntaje
                    mejorIntencion = intencion
        
        if len(todasCoincidencias) > 1:
            todasCoincidencias.sort(key=lambda x: x["puntaje"], reverse=True)
            mejorIntencion = todasCoincidencias[0]["intencion"]
            mejorPuntaje = todasCoincidencias[0]["puntaje"]
        
        if mejorIntencion and mejorPuntaje >= 5:
            confianza = min(mejorPuntaje / 30, 0.98)
            print(f"🎯 Intención detectada: {mejorIntencion} (confianza: {confianza:.2f}, puntaje: {mejorPuntaje})")
            return {"intencion": mejorIntencion, "confianza": confianza, "puntaje": mejorPuntaje}
        
        print("🎯 Intención no detectada claramente, usando conversación general")
        return {"intencion": "conversacion_general", "confianza": 0.5, "puntaje": 0}
    
    # ==================== DETECTOR INTELIGENTE DE MÚSICA ====================
    
    def detectarMusicaInteligente(self, texto):
        textoLower = texto.lower()
        
        palabrasNoMusica = ["meta", "metas", "objetivo", "objetivos", "logro", "logros", "tarea", "progreso", "avance", "hábito", "habito", "hábitos", "habitos", "completar", "cumplir", "alcanzar"]
        
        for palabra in palabrasNoMusica:
            if palabra in textoLower:
                print(f"🎵 [Música] Anulada por palabra: '{palabra}'")
                return {"esMusica": False, "categoria": None, "razon": f'contiene "{palabra}"'}
        
        palabrasMusica = ["música", "canción", "canciónes", "melodía", "audio", "sonido", "playlist", "lista de reproducción"]
        tienePalabraMusica = any(p in textoLower for p in palabrasMusica)
        
        verbosMusica = ["reproduce", "reproducir", "escuchar música", "pon música", "ponme música", "reproducir música", "activa música", "enciende música", "coloca música", "reproducir canción", "reproduce canción", "escuchar canción"]
        tieneVerboMusica = any(v in textoLower for v in verbosMusica)
        
        esMusica = tienePalabraMusica or tieneVerboMusica
        
        if not esMusica:
            return {"esMusica": False, "categoria": None}
        
        categoria = None
        
        if any(p in textoLower for p in ["concentración", "concentrarme", "estudio", "trabajo", "lofi", "clásica", "clasica"]):
            categoria = "concentracion"
        elif any(p in textoLower for p in ["dormir", "descanso", "relaj", "sueño", "noche", "lluvia"]):
            categoria = "dormir"
        elif any(p in textoLower for p in ["meditar", "meditación", "zen", "calma", "mindfulness", "paz"]):
            categoria = "meditar"
        elif any(p in textoLower for p in ["motivación", "motivacional", "energía", "animar", "alegre", "feliz", "positivo"]):
            categoria = "motivacion"
        
        return {"esMusica": True, "categoria": categoria}
    
    # ==================== MÉTODOS DE RESPUESTA ====================
    
    async def responderConsultaMetas(self):
        self.cargarTodosLosDatos()
        try:
            metas = json.loads(js.localStorage.getItem("metas_proyectos_v6") or "[]")
            metasActivas = [m for m in metas if not m.get("completado", False)]
            metasCompletadas = [m for m in metas if m.get("completado", False)]
            
            if not metasActivas and not metasCompletadas:
                return {
                    "texto": f"📭 Aún no tienes metas registradas, {self.usuario.nombre}. ¿Quieres crear una? Puedes decirme: 'Crear meta de aprender programación' o 'Nueva meta: hacer ejercicio 3 veces por semana'",
                    "emocion": "neutral",
                    "tipoRespuesta": "metas",
                    "confianza": 0.98
                }
            
            mensaje = f"🎯 **{self.usuario.nombre}, aquí están tus metas:**\n\n"
            
            if metasActivas:
                mensaje += f"📋 **En progreso ({len(metasActivas)}):**\n"
                for i, m in enumerate(metasActivas):
                    barra = self.generarBarraProgreso(m.get("progreso", 0))
                    mensaje += f"{i+1}. {m.get('nombre', '')}\n   {barra} {m.get('progreso', 0)}%\n"
            
            if metasCompletadas:
                mensaje += f"\n✅ **Completadas ({len(metasCompletadas)}):**\n"
                for m in metasCompletadas[:3]:
                    mensaje += f"   ✓ {m.get('nombre', '')}\n"
                if len(metasCompletadas) > 3:
                    mensaje += f"   ... y {len(metasCompletadas) - 3} más\n"
            
            mensaje += "\n💡 ¿Quieres actualizar el progreso de alguna?"
            
            self.ganarXP(5, "Consulta de metas")
            self.memoria.ultimoTema = "consultar_metas"
            
            return {
                "texto": mensaje,
                "emocion": "positivo",
                "tipoRespuesta": "metas",
                "confianza": 0.98,
                "datosContexto": {"metasActivas": len(metasActivas), "metasCompletadas": len(metasCompletadas)}
            }
        except Exception as e:
            print(f"Error al consultar metas: {e}")
            return None
    
    async def responderConsultaProgreso(self):
        self.cargarTodosLosDatos()
        
        metasActivas = self.datos.metas.get("activas", 0)
        metasCompletadas = self.datos.metas.get("completadas", 0)
        rachaHabitos = self.datos.habitos.get("rachaTotal", 0)
        ejerciciosHoy = self.datos.ejercicios.get("caloriasHoy", 0)
        minutosHoy = self.datos.ejercicios.get("minutosActivos", 0)
        suenoAnoche = self.datos.sueno.get("horasAnoche", 0)
        entradasLibro = self.datos.libroVida.get("totalEntradas", 0)
        nivel = self.memoria.evolucion.nivelActual
        xp = self.memoria.evolucion.xpTotal
        nombreNivel = PREGUNTAS_POR_NIVEL.get(f"nivel{nivel}", {}).get("nombre", "Explorador")
        
        mensaje = f"📊 **{self.usuario.nombre}, aquí está tu progreso:**\n\n"
        mensaje += f"🎯 **Nivel {nivel} - {nombreNivel}** | ✨ {xp} XP\n"
        mensaje += f"📖 {entradasLibro} reflexiones en tu Libro de Vida\n"
        mensaje += f"🎯 {metasCompletadas} metas completadas, {metasActivas} en progreso\n"
        mensaje += f"🔄 Racha de hábitos: {rachaHabitos} días\n"
        
        if ejerciciosHoy > 0:
            mensaje += f"🏃 Hoy has hecho {minutosHoy} minutos de ejercicio, quemando {ejerciciosHoy} kcal. ¡Excelente!\n"
        else:
            mensaje += f"🏃 ¿Qué tal si haces un poco de ejercicio hoy, {self.usuario.nombre}? Te ayudará con la energía.\n"
        
        if suenoAnoche > 0:
            mensaje += f"😴 Anoche dormiste {suenoAnoche} horas.\n"
        
        if self.memoria.perfilPsicologico.fortalezas and len(self.memoria.perfilPsicologico.fortalezas) > 0:
            fortalezaStr = self.memoria.perfilPsicologico.fortalezas[0] if isinstance(self.memoria.perfilPsicologico.fortalezas, list) else self.memoria.perfilPsicologico.fortalezas
            mensaje += f"\n💪 Recuerda que una de tus fortalezas es: {fortalezaStr}. ¡Aprovéchala hoy!"
        
        mensaje += f"\n\n💭 ¿Hay algo específico de lo que quieras saber más, {self.usuario.nombre}?"
        
        self.ganarXP(5, "Consulta de progreso")
        self.memoria.ultimoTema = "consultar_progreso"
        
        return {
            "texto": mensaje,
            "emocion": "positivo",
            "tipoRespuesta": "progreso",
            "confianza": 0.98,
            "datosContexto": {"nivel": nivel, "xp": xp, "metasActivas": metasActivas, "metasCompletadas": metasCompletadas, "rachaHabitos": rachaHabitos}
        }
    
    async def responderConsultaHabitos(self):
        self.cargarTodosLosDatos()
        try:
            habitos = json.loads(js.localStorage.getItem("habitos_v4") or "[]")
            hoy = datetime.now().strftime("%Y-%m-%d")
            
            if not habitos:
                return {
                    "texto": f"🔄 No tienes hábitos aún, {self.usuario.nombre}. ¿Quieres crear uno? Por ejemplo: 'Crear hábito de meditar 10 minutos' o 'Agregar hábito de leer 20 páginas diarias'",
                    "emocion": "neutral",
                    "tipoRespuesta": "habitos",
                    "confianza": 0.95
                }
            
            mensaje = f"🔄 **Tus hábitos, {self.usuario.nombre}:**\n\n"
            for h in habitos[:5]:
                completadoHoy = hoy in h.get("completados", [])
                status = "✅" if completadoHoy else "⭕"
                mensaje += f"{status} {h.get('nombre', '')} | 🔥 Racha: {h.get('racha', 0)} días\n"
            
            mensaje += f"\n💪 ¿Completaste algún hábito hoy, {self.usuario.nombre}?"
            
            self.ganarXP(3, "Consulta de hábitos")
            self.memoria.ultimoTema = "consultar_habitos"
            
            return {
                "texto": mensaje,
                "emocion": "neutral",
                "tipoRespuesta": "habitos",
                "confianza": 0.95
            }
        except Exception as e:
            return {
                "texto": f"🔄 ¿Qué hábitos te gustaría desarrollar, {self.usuario.nombre}?",
                "emocion": "neutral",
                "tipoRespuesta": "habitos",
                "confianza": 0.9
            }
    
    async def responderConsultaEjercicios(self):
        self.cargarTodosLosDatos()
        ejercicios = self.datos.ejercicios
        if ejercicios.get("caloriasHoy", 0) > 0:
            return {
                "texto": f"🏃 {self.usuario.nombre}, hoy has hecho {ejercicios.get('caloriasHoy', 0)} kcal y {ejercicios.get('minutosActivos', 0)} minutos. {f'Llevas {ejercicios.get('racha', 0)} días seguidos.' if ejercicios.get('racha', 0) > 0 else ''} ¡Sigue así!",
                "emocion": "positivo",
                "tipoRespuesta": "ejercicios",
                "confianza": 0.95
            }
        else:
            return {
                "texto": f"🏃 Aún no has registrado ejercicio hoy, {self.usuario.nombre}. ¿Qué tal si empiezas con 10 minutos de caminata?",
                "emocion": "neutral",
                "tipoRespuesta": "ejercicios",
                "confianza": 0.9
            }
    
    async def responderConsultaSueno(self):
        self.cargarTodosLosDatos()
        sueno = self.datos.sueno
        if sueno.get("horasAnoche", 0) > 0:
            mensaje = f"😴 Gracias por compartir, {self.usuario.nombre}. Anoche dormiste {sueno.get('horasAnoche', 0)} horas."
            if sueno.get("calidad", 0) > 0:
                mensaje += f" Calidad: {sueno.get('calidad', 0)}/10."
            if sueno.get("horasAnoche", 0) < 7:
                mensaje += " Recuerda que lo ideal son 7-8 horas. ¿Qué te impide dormir más?"
            else:
                mensaje += " ¡Excelente descanso! Eso se nota en tu energía."
            return {
                "texto": mensaje,
                "emocion": "neutral",
                "tipoRespuesta": "sueno",
                "confianza": 0.95
            }
        else:
            return {
                "texto": f"😴 No tengo registro de tu sueño de anoche, {self.usuario.nombre}. ¿Cómo dormiste? Dormir bien es fundamental para tu bienestar.",
                "emocion": "neutral",
                "tipoRespuesta": "sueno",
                "confianza": 0.9
            }
    
    async def responderConsultaLogros(self):
        self.cargarTodosLosDatos()
        logros = self.datos.logros
        mensaje = f"🏆 {self.usuario.nombre}, has obtenido {logros.get('total', 0)} logros."
        if logros.get("recientes") and len(logros.get("recientes", [])) > 0:
            mensaje += f" Los más recientes: {', '.join(logros.get('recientes', [])[:3])}"
        mensaje += " ¡Sigue así!"
        return {
            "texto": mensaje,
            "emocion": "positivo",
            "tipoRespuesta": "logros",
            "confianza": 0.95
        }
    
    async def responderConsultaComunidad(self):
        self.cargarTodosLosDatos()
        comunidad = self.datos.comunidad
        return {
            "texto": f"🌍 {self.usuario.nombre}, has compartido {comunidad.get('misPublicaciones', 0)} publicaciones y tienes {comunidad.get('seguidores', 0)} seguidores. ¡La comunidad te valora!",
            "emocion": "positivo",
            "tipoRespuesta": "comunidad",
            "confianza": 0.95
        }
    
    async def responderCrisis(self, texto):
        self.cargarTodosLosDatos()
        
        palabrasGraves = ["suicidio", "morir", "muerte", "acabar con todo", "no quiero vivir", "lastimarme", "cortarme"]
        esGrave = any(p in texto.lower() for p in palabrasGraves)
        
        if esGrave:
            return {
                "texto": f"🆘 **ATENCIÓN IMPORTANTE, {self.usuario.nombre}**\n\nLo que estás sintiendo es muy importante. No estás solo/a.\n\n📞 **Línea de Prevención del Suicidio (Perú):** 0800-000-000 (opción 3)\n📞 **Línea de Ayuda:** 113 (opción 5)\n💬 **Chat de Apoyo:** disponible 24/7 en tu app\n\nPor favor, contacta con un profesional. Tu vida es valiosa. ¿Quieres que busque ayuda para ti ahora mismo?",
                "emocion": "triste",
                "tipoRespuesta": "crisis_grave",
                "confianza": 0.99
            }
        
        crisis = self.datos.crisis
        if crisis.get("planSeguridad", False):
            return {
                "texto": f"🛡️ {self.usuario.nombre}, tienes un plan de seguridad activo. Recuerda: respira profundo, contacta a tu persona de confianza, y si la crisis es fuerte, llama a la línea de ayuda. ¿Necesitas que repase tu plan contigo?",
                "emocion": "empatico",
                "tipoRespuesta": "crisis",
                "confianza": 0.95
            }
        else:
            return {
                "texto": f"🛡️ {self.usuario.nombre}, lamento que estés pasando por esto. Quiero que sepas que no estás solo/a. ¿Te gustaría que creemos juntos un plan de seguridad? También puedes contactar a la línea de ayuda: 0800-000-000. Estoy aquí para ti.",
                "emocion": "empatico",
                "tipoRespuesta": "crisis",
                "confianza": 0.95
            }
    
    async def responderConsultaBiblioteca(self):
        self.cargarTodosLosDatos()
        biblioteca = self.datos.biblioteca
        mensaje = f"📚 {self.usuario.nombre}, tienes {biblioteca.get('totalLibros', 0)} libros en tu biblioteca, {biblioteca.get('leidos', 0)} leídos."
        if biblioteca.get('favoritos', 0) > 0:
            mensaje += f" Tienes {biblioteca.get('favoritos', 0)} libros marcados como favoritos."
        if biblioteca.get('ultimoAgregado'):
            mensaje += f" El último que agregaste fue: '{biblioteca.get('ultimoAgregado')}'."
        return {
            "texto": mensaje,
            "emocion": "neutral",
            "tipoRespuesta": "biblioteca",
            "confianza": 0.95
        }
    
    async def responderConsultaMapas(self):
        self.cargarTodosLosDatos()
        mapas = self.datos.mapas
        return {
            "texto": f"🗺️ {self.usuario.nombre}, tienes {mapas.get('total', 0)} mapas mentales creados. {f'{mapas.get('favoritos', 0)} de ellos son tus favoritos.' if mapas.get('favoritos', 0) > 0 else ''} ¿Quieres crear uno nuevo?",
            "emocion": "neutral",
            "tipoRespuesta": "mapas",
            "confianza": 0.95
        }
    
    async def responderConsultaPlugins(self):
        self.cargarTodosLosDatos()
        plugins = self.datos.plugins
        return {
            "texto": f"🔌 {self.usuario.nombre}, tienes {plugins.get('instalados', 0)} plugins instalados, {plugins.get('activos', 0)} activos. ¿Quieres explorar la tienda para más funcionalidades?",
            "emocion": "neutral",
            "tipoRespuesta": "plugins",
            "confianza": 0.95
        }
    
    async def responderConsultaCuestionarios(self):
        self.cargarTodosLosDatos()
        cuestionarios = self.datos.cuestionarios
        mensaje = f"📋 {self.usuario.nombre}, has realizado {cuestionarios.get('totalRealizados', 0)} cuestionarios."
        if self.memoria.perfilPsicologico.personalidad:
            mensaje += " Conozco tu perfil de personalidad. ¿Te gustaría profundizar en algún aspecto específico?"
        else:
            mensaje += " Te recomiendo completar el cuestionario de personalidad para conocerte mejor. ¿Quieres empezar?"
        return {
            "texto": mensaje,
            "emocion": "neutral",
            "tipoRespuesta": "cuestionarios",
            "confianza": 0.95
        }
    
    async def responderBienestarEmocional(self, texto, emocion):
        self.cargarTodosLosDatos()
        
        emocionDetectada = None
        emocionesLista = ["alegría", "feliz", "triste", "enojo", "ira", "ansiedad", "ansioso", "miedo", "calma", "tranquilo", "motivado", "gratitud", "agradecido", "soledad", "esperanza", "confianza", "inseguro", "orgullo", "vergüenza", "culpa"]
        
        for emo in emocionesLista:
            if emo in texto.lower():
                emocionDetectada = emo
                break
        
        if emocionDetectada:
            try:
                emociones = json.loads(js.localStorage.getItem("estados_animo") or "[]")
                emociones.insert(0, {"emocion": emocionDetectada, "fecha": datetime.now().isoformat()})
                js.localStorage.setItem("estados_animo", json.dumps(emociones[:50]))
            except Exception as e:
                pass
            
            respuestasEmocionales = {
                "triste": f"💙 Entiendo que te sientes triste, {self.usuario.nombre}. Está bien sentir eso. ¿Quieres hablar de lo que te tiene así? Estoy aquí para escucharte.",
                "ansiedad": f"😰 La ansiedad puede ser abrumadora, {self.usuario.nombre}. Respira profundo conmigo: inhala... exhala... ¿Qué es lo que más te preocupa ahora mismo?",
                "feliz": f"😊 ¡Qué bonito, {self.usuario.nombre}! Me alegra mucho que te sientas feliz. ¿Qué te tiene así de contento?",
                "motivado": f"💪 ¡Esa energía es increíble, {self.usuario.nombre}! Aprovechemos esa motivación. ¿Qué quieres lograr hoy?",
                "gratitud": f"🙏 La gratitud es una de las emociones más poderosas, {self.usuario.nombre}. ¿De qué o quién te sientes agradecido/a?",
                "tranquilo": f"😌 La calma es un regalo, {self.usuario.nombre}. ¿Qué te ayudó a sentirte así?",
                "confianza": f"✨ Qué bien que te sientas seguro/a, {self.usuario.nombre}. ¿Qué te hace sentir así de confiado/a?"
            }
            
            respuesta = respuestasEmocionales.get(emocionDetectada, f"🧠 Gracias por compartir tu emoción, {self.usuario.nombre}. Reconocer cómo te sientes es el primer paso para gestionarlo. ¿Quieres profundizar en esto?")
            
            self.ganarXP(3, "Registro emocional")
            self.memoria.ultimoTema = "bienestar_emocional"
            
            return {
                "texto": respuesta,
                "emocion": "triste" if emocionDetectada == "triste" else "positivo",
                "tipoRespuesta": "bienestar_emocional",
                "confianza": 0.95,
                "datosContexto": {"emocion": emocionDetectada}
            }
        
        return None
    
    async def responderPerfil(self):
        mensaje = f"👤 **{self.usuario.nombre}, este es tu perfil actual:**\n\n"
        mensaje += f"📛 Nombre: {self.usuario.nombre}\n"
        mensaje += f"🎯 Nivel: {self.memoria.evolucion.nivelActual} ({PREGUNTAS_POR_NIVEL.get(f'nivel{self.memoria.evolucion.nivelActual}', {}).get('nombre', 'Aprendiz')})\n"
        mensaje += f"✨ XP: {self.memoria.evolucion.xpTotal}\n"
        
        if self.memoria.perfilPsicologico.personalidad:
            mensaje += f"🧠 Personalidad: {self.memoria.perfilPsicologico.personalidad}\n"
        
        if self.memoria.perfilPsicologico.fortalezas and len(self.memoria.perfilPsicologico.fortalezas) > 0:
            fortalezasStr = ", ".join(self.memoria.perfilPsicologico.fortalezas) if isinstance(self.memoria.perfilPsicologico.fortalezas, list) else self.memoria.perfilPsicologico.fortalezas
            mensaje += f"💪 Fortalezas: {fortalezasStr}\n"
        
        if self.memoria.perfilPsicologico.proposito:
            mensaje += f"🎯 Propósito: {self.memoria.perfilPsicologico.proposito}\n"
        
        if self.memoria.informacionUsuario.hobbies and len(self.memoria.informacionUsuario.hobbies) > 0:
            mensaje += f"🎨 Hobbies: {', '.join(self.memoria.informacionUsuario.hobbies[:3])}\n"
        
        mensaje += "\n💡 ¿Quieres actualizar algún dato de tu perfil?"
        
        return {
            "texto": mensaje,
            "emocion": "neutral",
            "tipoRespuesta": "perfil",
            "confianza": 0.95
        }
    
    async def responderAyuda(self):
        helpText = f"""✨ **{self.usuario.nombre}, esto es lo que puedo hacer por ti:** ✨

🎯 **METAS**
• 'Crear meta de [nombre]' - Establece un nuevo objetivo
• 'Mis metas' - Ver tus metas actuales
• 'Mi meta [nombre] va al 50%' - Actualizar progreso

🔄 **HÁBITOS**
• 'Crear hábito de [acción]' - Nuevo hábito diario
• 'Completé mi hábito de [nombre]' - Marcar como hecho
• 'Mis hábitos' - Ver lista y rachas

🏃 **EJERCICIO**
• 'Hice 30 minutos de cardio' - Registrar ejercicio
• 'Mis ejercicios' - Ver estadísticas

😴 **SUEÑO**
• 'Dormí 7 horas calidad 8' - Registrar sueño

🎵 **MÚSICA**
• 'Pon música para concentrarme' - Música de estudio
• 'Pon música para dormir' - Música relajante
• 'Música motivacional' - Energía y ánimo

📊 **PROGRESO**
• 'Mi progreso' - Resumen completo de todo

📚 **BIBLIOTECA**
• 'Mis libros' - Ver tu biblioteca
• 'Agregar libro [título]' - Añadir a tu colección

📖 **LIBRO DE VIDA**
• 'Guardar reflexión: [texto]' - Registrar pensamientos

🏆 **LOGROS**
• 'Mis logros' - Ver medallas obtenidas

🌍 **COMUNIDAD**
• 'Comunidad' - Ver actividad social

🛡️ **CRISIS**
• 'No estoy bien' - Recibir apoyo inmediato

📋 **CUESTIONARIOS**
• 'Test de personalidad' - Conocerte mejor

👤 **PERFIL**
• 'Mi perfil' - Ver tu información
• 'Me llamo [nombre]' - Registrar tu nombre

💬 **¿Qué te gustaría hacer hoy?**"""
        
        return {
            "texto": helpText,
            "emocion": "neutral",
            "tipoRespuesta": "ayuda",
            "confianza": 0.98
        }
    
    def generarBarraProgreso(self, porcentaje):
        lleno = porcentaje // 10
        vacio = 10 - lleno
        return "█" * lleno + "░" * vacio
    
    # ==================== CONFIGURACIÓN GEMINI API ====================
    
    def cargarPerfilCuestionarios(self):
        try:
            respuestas = json.loads(js.localStorage.getItem("cuestionarios_respuestas") or "{}")
            completados = json.loads(js.localStorage.getItem("cuestionarios_completados") or "[]")
            
            self.datos.cuestionarios["totalRealizados"] = len(completados)
            self.datos.cuestionarios["resultados"] = respuestas
            
            if "big_five" in respuestas and "interpretacion" in respuestas["big_five"]:
                self.memoria.perfilPsicologico.personalidad = respuestas["big_five"]["interpretacion"]
            
            if "inteligencia_emocional" in respuestas and "interpretacion" in respuestas["inteligencia_emocional"]:
                self.memoria.perfilPsicologico.inteligenciaEmocional = respuestas["inteligencia_emocional"]["interpretacion"]
            
            if "aprendizaje" in respuestas and "interpretacion" in respuestas["aprendizaje"]:
                self.memoria.perfilPsicologico.estiloAprendizaje = respuestas["aprendizaje"]["interpretacion"]
            
            if "fortalezas" in respuestas and "interpretacion" in respuestas["fortalezas"]:
                if isinstance(respuestas["fortalezas"]["interpretacion"], list):
                    self.memoria.perfilPsicologico.fortalezas = respuestas["fortalezas"]["interpretacion"]
                else:
                    self.memoria.perfilPsicologico.fortalezas = [respuestas["fortalezas"]["interpretacion"]]
            
            if "mindset" in respuestas and "interpretacion" in respuestas["mindset"]:
                self.memoria.perfilPsicologico.mindset = respuestas["mindset"]["interpretacion"]
            
            if "proposito" in respuestas and "interpretacion" in respuestas["proposito"]:
                self.memoria.perfilPsicologico.proposito = respuestas["proposito"]["interpretacion"]
                self.usuario.proposito = respuestas["proposito"]["interpretacion"]
            
            if "perfil_basico" in respuestas:
                if "edad" in respuestas["perfil_basico"]:
                    self.memoria.informacionUsuario.edad = respuestas["perfil_basico"]["edad"]
                if "ocupacion" in respuestas["perfil_basico"]:
                    self.memoria.informacionUsuario.ocupacion = respuestas["perfil_basico"]["ocupacion"]
                if "motivacion" in respuestas["perfil_basico"]:
                    self.memoria.informacionUsuario.motivaciones.append(respuestas["perfil_basico"]["motivacion"])
            
            print("📊 Perfil psicológico cargado desde cuestionarios")
            print(f"   Personalidad: {'✓' if self.memoria.perfilPsicologico.personalidad else 'Pendiente'}")
            print(f"   IE: {'✓' if self.memoria.perfilPsicologico.inteligenciaEmocional else 'Pendiente'}")
            print(f"   Fortalezas: {'✓' if self.memoria.perfilPsicologico.fortalezas else 'Pendiente'}")
            print(f"   Propósito: {'✓' if self.memoria.perfilPsicologico.proposito else 'Pendiente'}")
            
        except Exception as e:
            print("No se encontraron cuestionarios completados")
    
    def cargarInformacionUsuario(self):
        try:
            infoGuardada = js.localStorage.getItem("reprompt_usuario_info")
            if infoGuardada:
                info = json.loads(infoGuardada)
                for key, value in info.items():
                    if hasattr(self.memoria.informacionUsuario, key):
                        setattr(self.memoria.informacionUsuario, key, value)
                if info.get("nombre") and info.get("nombre") != "Usuario":
                    self.usuario.nombre = info.get("nombre")
        except Exception as e:
            pass
        
        try:
            perfil = json.loads(js.localStorage.getItem("reprompt_perfil_v6") or "{}")
            if perfil.get("nombre") and perfil.get("nombre") != "Usuario":
                self.usuario.nombre = perfil.get("nombre")
                self.memoria.informacionUsuario.nombre = perfil.get("nombre")
        except Exception as e:
            pass
        
        try:
            user = json.loads(js.localStorage.getItem("repromt_user") or "{}")
            if user.get("nombre") and user.get("nombre") != "Usuario":
                self.usuario.nombre = user.get("nombre")
                self.memoria.informacionUsuario.nombre = user.get("nombre")
        except Exception as e:
            pass
        
        print(f"👤 Usuario: {self.usuario.nombre}")
    
    def guardarInformacionUsuario(self):
        try:
            js.localStorage.setItem("reprompt_usuario_info", json.dumps({
                "nombre": self.memoria.informacionUsuario.nombre,
                "edad": self.memoria.informacionUsuario.edad,
                "ocupacion": self.memoria.informacionUsuario.ocupacion,
                "hobbies": self.memoria.informacionUsuario.hobbies,
                "motivaciones": self.memoria.informacionUsuario.motivaciones,
                "miedos": self.memoria.informacionUsuario.miedos,
                "fortalezas": self.memoria.informacionUsuario.fortalezas
            }))
        except Exception as e:
            pass
    
    # ==================== FUNCIONES DE MÚSICA ====================
    
    def reproducirMusica(self, categoria, busqueda=None):
        print(f"🎵 IA: Reproducir música - Categoría: {categoria}")
        
        tracksPorCategoria = {
            "concentracion": {"id": 1, "nombre": "LoFi Hip Hop Radio", "artista": "LoFi Girl", "duracion": "∞", "youtubeId": "5qap5aO4i9A", "tipo": "live"},
            "dormir": {"id": 4, "nombre": "528 Hz - Sanación Profunda", "artista": "Frecuencia del Amor", "duracion": "∞", "youtubeId": "YkBntoPOOUM", "tipo": "live"},
            "meditar": {"id": 7, "nombre": "Meditación Guiada", "artista": "Mindfulness", "duracion": "30 min", "youtubeId": "inpok4MKVLM", "tipo": "video"},
            "motivacion": {"id": 9, "nombre": "Música Motivacional", "artista": "Epic Music", "duracion": "60 min", "youtubeId": "ASj81daun5Q", "tipo": "video"}
        }
        
        categoriaNormalizada = categoria
        catLower = categoria.lower()
        if any(p in catLower for p in ["concent", "estudio", "trabajo", "lofi", "clasica"]):
            categoriaNormalizada = "concentracion"
        elif any(p in catLower for p in ["dorm", "descans", "relaj", "sueno", "noche", "lluvia"]):
            categoriaNormalizada = "dormir"
        elif any(p in catLower for p in ["medit", "zen", "calma", "mindfulness", "paz"]):
            categoriaNormalizada = "meditar"
        elif any(p in catLower for p in ["motiv", "energ", "anim", "alegre", "feliz", "positivo"]):
            categoriaNormalizada = "motivacion"
        
        track = tracksPorCategoria.get(categoriaNormalizada)
        if not track:
            print(f"⚠️ No hay track para: {categoria}")
            return False
        
        # Emitir evento para el frontend
        try:
            event = js.CustomEvent.new("reprompt-music-command", {
                "detail": {"action": "play", "track": track}
            })
            js.document.dispatchEvent(event)
            print(f"✅ Evento enviado: reprompt-music-command")
            return True
        except Exception as e:
            print(f"⚠️ Error al emitir evento: {e}")
            return False
    
    def reproducirAudiolibro(self, titulo, autor):
        print(f"📖 IA: Reproducir audiolibro - {titulo}")
        
        track = None
        textoLower = titulo.lower()
        
        if "hábitos" in textoLower or "atomicos" in textoLower:
            track = {"id": 11, "nombre": "Hábitos Atómicos", "artista": "James Clear", "duracion": "15 min", "youtubeId": "U5PZmN4wI2s", "tipo": "video"}
        elif "poder" in textoLower or "ahora" in textoLower:
            track = {"id": 12, "nombre": "El Poder del Ahora", "artista": "Eckhart Tolle", "duracion": "20 min", "youtubeId": "xLJotO8OEo8", "tipo": "video"}
        else:
            track = {"id": 11, "nombre": titulo, "artista": autor or "Desconocido", "duracion": "30 min", "youtubeId": "U5PZmN4wI2s", "tipo": "video"}
        
        try:
            event = js.CustomEvent.new("reprompt-audio-command", {
                "detail": {"action": "play", "track": track}
            })
            js.document.dispatchEvent(event)
            return True
        except Exception as e:
            return False
    
    def abrirAppMusica(self):
        try:
            if hasattr(js, "window") and hasattr(js.window, "app") and hasattr(js.window.app, "openApp"):
                js.window.app.openApp("musica")
                print("🎵 Abriendo App de Música")
                return True
        except Exception as e:
            pass
        return False
    
    def obtenerPreguntaProactiva(self):
        todasPreguntas = self.preguntasProactivas["basico"] + self.preguntasProactivas["profundo"] + self.preguntasProactivas["contexto"]
        
        noRealizadas = [p for p in todasPreguntas if p not in self.memoria.preguntasRealizadas]
        
        if noRealizadas:
            pregunta = random.choice(noRealizadas)
        else:
            self.memoria.preguntasRealizadas.clear()
            pregunta = random.choice(todasPreguntas)
        
        self.memoria.preguntasRealizadas.add(pregunta)
        return pregunta
    
    def procesarRespuestaProactiva(self, pregunta, respuesta):
        respuestaLower = respuesta.lower()
        info = self.memoria.informacionUsuario
        
        if "apasiona" in pregunta:
            info.hobbies.append(respuesta)
        elif "fortaleza" in pregunta:
            info.fortalezas.append(respuesta)
            self.memoria.perfilPsicologico.fortalezas = [respuesta]
        elif "miedo" in pregunta:
            info.miedos.append(respuesta)
        elif "motiva" in pregunta:
            info.motivaciones.append(respuesta)
        elif "éxito" in pregunta:
            self.usuario.valores.append(respuesta)
        elif "sueño" in pregunta:
            self.usuario.proposito = respuesta
            self.memoria.perfilPsicologico.proposito = respuesta
        
        self.guardarInformacionUsuario()
        print(f"📝 Información guardada: {pregunta[:40]}... -> {respuesta[:40]}...")
    
    # ==================== INICIALIZACIÓN ====================
    
    def inicializar(self):
        print("🧠 REPROMPT Intelligence v36.0.0 - INTELIGENCIA TOTAL - 18 SISTEMAS")
        print("✨ Usando modelo: " + self.gemini.model)
        print("🎯 XP actual: " + str(self.memoria.evolucion.xpTotal))
        
        self.cargarTodo()
        self.cargarDatosReprompt()
        self.cargarOrganizacion()
        self.detectarArquetipo()
        self.mostrarEstadisticas()
        self.calcularNivelInicial()
    
    def mostrarEstadisticas(self):
        print(f"✨ NIVEL: {self.memoria.evolucion.nivelActual} | XP: {self.memoria.evolucion.xpTotal}")
        print(f"🤖 Gemini API: {'CONECTADO ✅' if self.gemini.disponible else 'VERIFICANDO...'}")
        print(f"👤 Usuario: {self.usuario.nombre}")
        print(f"📊 Cuestionarios: {self.datos.cuestionarios.get('totalRealizados', 0)} completados")
        print(f"📚 Auto-aprendizaje: {len(self.aprendizaje.vocabulario['palabras'])} palabras aprendidas")
    
    async def verificarGeminiConReintento(self):
        intento = 0
        maxIntentos = 3
        
        while intento < maxIntentos and not self.gemini.disponible:
            try:
                conectado = await self.verificarGemini()
                if conectado:
                    return True
                
                intento += 1
                if intento < maxIntentos:
                    tiempoEspera = self.gemini.tiempoEsperaBase * pow(2, intento - 1)
                    print(f"⏳ Reintentando en {tiempoEspera/1000} segundos... (Intento {intento + 1}/{maxIntentos})")
                    await asyncio.sleep(tiempoEspera / 1000)
            except Exception as error:
                print(f"⚠️ Error en intento {intento + 1}: {error}")
                intento += 1
                if intento < maxIntentos:
                    await asyncio.sleep(5)
        
        if not self.gemini.disponible:
            print("⚠️ Modo offline activado - Puedes seguir usando el asistente")
            print("💡 Las respuestas serán locales hasta que la API se recupere")
        return False
    
    async def verificarGemini(self):
        try:
            url = f"{self.gemini.baseUrl}/models/{self.gemini.model}:generateContent?key={self.gemini.apiKey}"
            
            print("🔍 Verificando conexión con Gemini...")
            
            import asyncio
            import aiohttp
            
            payload = {
                "contents": [{"parts": [{"text": "Hola"}]}],
                "generationConfig": {"maxOutputTokens": 5}
            }
            
            timeout = aiohttp.ClientTimeout(total=8)
            
            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.post(url, json=payload) as response:
                    if response.status == 429:
                        print("⏳ API saturada (429), esperando recuperación...")
                        return False
                    
                    if response.status == 200:
                        self.gemini.disponible = True
                        print("✅ Gemini API CONECTADA!")
                        print("🎉 ¡La IA ahora tiene inteligencia real!")
                        return True
                    
                    return False
        except Exception as error:
            if "Timeout" in str(error) or "timeout" in str(error).lower():
                print("⏳ Timeout en verificación")
            return False
    
    async def generarConGemini(self, analisis, reintento=0):
        if not self.gemini.disponible:
            return None
        
        try:
            import aiohttp
            import asyncio
            
            url = f"{self.gemini.baseUrl}/models/{self.gemini.model}:generateContent?key={self.gemini.apiKey}"
            
            infoPersonalidad = ""
            if self.memoria.perfilPsicologico.personalidad:
                infoPersonalidad += f"\nPerfil de personalidad: {self.memoria.perfilPsicologico.personalidad[:100]}"
            if self.memoria.perfilPsicologico.fortalezas:
                fortalezasStr = ", ".join(self.memoria.perfilPsicologico.fortalezas) if isinstance(self.memoria.perfilPsicologico.fortalezas, list) else self.memoria.perfilPsicologico.fortalezas
                infoPersonalidad += f"\nFortalezas: {fortalezasStr}"
            if self.memoria.perfilPsicologico.proposito:
                infoPersonalidad += f"\nPropósito: {self.memoria.perfilPsicologico.proposito}"
            
            contextoDatos = ""
            if self.datos.metas.get("activas", 0) > 0:
                contextoDatos += f"\nTiene {self.datos.metas.get('activas', 0)} metas activas."
            if self.datos.habitos.get("rachaTotal", 0) > 0:
                contextoDatos += f"\nRacha de hábitos: {self.datos.habitos.get('rachaTotal', 0)} días."
            
            sistemaPrompt = f"""Eres REPROMPT, un consejero personal cálido, empático y sabio. Formas parte del sistema operativo de desarrollo personal Reprompt OS.
Usuario: {self.usuario.nombre}
Emoción: {analisis.get('emocionPrincipal', 'neutral')}
{infoPersonalidad}
{contextoDatos}

Responde de forma natural, cálida y breve (1-2 líneas). Usa el nombre del usuario en tu respuesta."""
            
            payload = {
                "contents": [{"parts": [{"text": sistemaPrompt + "\n\nUsuario: " + analisis.get("original", "") + "\n\nREPROMPT:"}]}],
                "generationConfig": {
                    "temperature": self.gemini.temperature,
                    "maxOutputTokens": self.gemini.maxTokens
                }
            }
            
            timeout = aiohttp.ClientTimeout(total=self.gemini.timeout / 1000)
            
            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.post(url, json=payload) as response:
                    if response.status == 429:
                        if reintento < 2:
                            espera = 3 * (reintento + 1)
                            print(f"⏳ API saturada, esperando {espera}s antes de reintentar...")
                            await asyncio.sleep(espera)
                            return await self.generarConGemini(analisis, reintento + 1)
                        print("⏳ Límite de peticiones, usando respuesta local")
                        return None
                    
                    if response.status != 200:
                        return None
                    
                    data = await response.json()
                    respuesta = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text")
                    
                    if respuesta:
                        respuesta = respuesta.strip()
                        return {
                            "texto": respuesta,
                            "tipo": "generativa",
                            "confianza": 0.95
                        }
                    
                    return None
        except Exception as e:
            if reintento < 2 and "Timeout" not in str(e):
                await asyncio.sleep(2)
                return await self.generarConGemini(analisis, reintento + 1)
            return None
    
    # ==================== ANÁLISIS DE TEXTO CON CONTEXTO ====================
    
    def analizarProfundamente(self, texto):
        textoLower = texto.lower()
        textoTrim = texto.strip()
        
        emocion = "neutral"
        if any(p in textoLower for p in ["triste", "deprimido", "mal", "llorar"]):
            emocion = "triste"
        elif any(p in textoLower for p in ["feliz", "alegre", "contento", "genial"]):
            emocion = "feliz"
        elif any(p in textoLower for p in ["motivado", "energía", "inspirado"]):
            emocion = "motivado"
        elif any(p in textoLower for p in ["gracias", "agradecido"]):
            emocion = "agradecido"
        elif any(p in textoLower for p in ["ansioso", "nervioso", "preocupado"]):
            emocion = "ansioso"
        
        criticaRepeticion = bool(re.search(r'repites|repite|repetir|no funciona|no sirve|sigo igual|mal|gastada|cortando', textoLower))
        
        conversacionesRecientes = self.memoria.conversaciones[:3]
        historialContexto = ""
        
        if conversacionesRecientes:
            historialContexto = "\n\n📜 Contexto de conversación reciente:\n"
            for conv in conversacionesRecientes:
                historialContexto += f'Usuario dijo: "{conv.get("pregunta", "")}"\nREPROMPT respondió: "{conv.get("respuesta", "")[:100]}"\n'
        
        return {
            "emocionPrincipal": emocion,
            "criticaRepeticion": criticaRepeticion,
            "original": texto,
            "historialContexto": historialContexto
        }
    
    # ==================== ACCESO A TODOS LOS 18 SISTEMAS ====================
    
    def cargarTodosLosDatos(self):
        print("📡 Cargando datos de los 18 sistemas...")
        
        try:
            libro = json.loads(js.localStorage.getItem("reprompt_libro_v3") or "{}")
            self.datos.dashboard = {
                "totalEntradas": len(libro.get("entradas", [])),
                "nivel": self.memoria.evolucion.nivelActual,
                "racha": self.usuario.racha or 0
            }
        except Exception as e:
            pass
        
        try:
            libro = json.loads(js.localStorage.getItem("reprompt_libro_v3") or "{}")
            emociones = [e.get("emocion") for e in libro.get("entradas", []) if e.get("emocion")]
            conteo = {}
            for e in emociones:
                conteo[e] = conteo.get(e, 0) + 1
            self.datos.emocional = {
                "ultimaEmocion": emociones[0] if emociones else None,
                "resumen": conteo,
                "historial": emociones[:10]
            }
        except Exception as e:
            pass
        
        try:
            profesionales = json.loads(js.localStorage.getItem("profesionales_conectados") or "[]")
            citas = json.loads(js.localStorage.getItem("citas_agendadas") or "[]")
            self.datos.profesionales = {
                "conectados": len(profesionales),
                "proximasCitas": len(citas)
            }
        except Exception as e:
            pass
        
        try:
            metas = json.loads(js.localStorage.getItem("metas_proyectos_v6") or "[]")
            self.datos.metas = {
                "total": len(metas),
                "activas": len([m for m in metas if not m.get("completado", False)]),
                "completadas": len([m for m in metas if m.get("completado", False)]),
                "progresoPromedio": sum(m.get("progreso", 0) for m in metas) / (len(metas) or 1),
                "lista": [{"nombre": m.get("nombre", ""), "progreso": m.get("progreso", 0)} for m in metas[:5]]
            }
        except Exception as e:
            pass
        
        try:
            habitos = json.loads(js.localStorage.getItem("habitos_v4") or "[]")
            self.datos.habitos = {
                "total": len(habitos),
                "rachaTotal": sum(h.get("racha", 0) for h in habitos),
                "mejorRacha": max([h.get("racha", 0) for h in habitos]) if habitos else 0,
                "activos": len([h for h in habitos if h.get("activo", True)]),
                "lista": [{"nombre": h.get("nombre", ""), "racha": h.get("racha", 0)} for h in habitos[:5]]
            }
        except Exception as e:
            pass
        
        try:
            ejercicios = json.loads(js.localStorage.getItem("ejercicios_v4") or "[]")
            hoy = datetime.now().strftime("%Y-%m-%d")
            ejerciciosHoy = [e for e in ejercicios if e.get("fecha") == hoy]
            self.datos.ejercicios = {
                "total": len(ejercicios),
                "caloriasHoy": sum(e.get("calorias", 0) for e in ejerciciosHoy),
                "minutosActivos": sum(e.get("duracion", 0) for e in ejerciciosHoy),
                "racha": self.calcularRachaEjercicios(ejercicios),
                "ultimoEjercicio": ejercicios[0].get("nombre") if ejercicios else None
            }
        except Exception as e:
            pass
        
        try:
            sueno = json.loads(js.localStorage.getItem("sueno_v4") or "[]")
            hoy = datetime.now().strftime("%Y-%m-%d")
            suenoAnoche = next((s for s in sueno if s.get("fecha") == hoy), None)
            self.datos.sueno = {
                "horasAnoche": suenoAnoche.get("horas", 0) if suenoAnoche else 0,
                "calidad": suenoAnoche.get("calidad", 0) if suenoAnoche else 0,
                "promedioSemana": self.calcularPromedioSueno(sueno, 7),
                "racha": self.calcularRachaSueno(sueno)
            }
        except Exception as e:
            pass
        
        try:
            musica = json.loads(js.localStorage.getItem("musica_preferencias") or "{}")
            playlist = json.loads(js.localStorage.getItem("playlists_usuario") or "[]")
            self.datos.musica = {
                "generoFavorito": musica.get("genero"),
                "cancionesFavoritas": len(musica.get("favoritas", [])),
                "playlistActivas": len(playlist),
                "ultimaEscuchada": musica.get("ultimaCancion")
            }
        except Exception as e:
            pass
        
        try:
            publicaciones = json.loads(js.localStorage.getItem("comunidad_publicaciones") or "[]")
            misPublicaciones = [p for p in publicaciones if p.get("usuarioId") == self.usuario.id]
            seguidores = json.loads(js.localStorage.getItem("mis_seguidores") or "[]")
            self.datos.comunidad = {
                "misPublicaciones": len(misPublicaciones),
                "interaccions": sum(p.get("likes", 0) + p.get("comentarios", 0) for p in misPublicaciones),
                "seguidores": len(seguidores)
            }
        except Exception as e:
            pass
        
        try:
            recursos = json.loads(js.localStorage.getItem("recursos_crisis") or "[]")
            planSeguridad = bool(js.localStorage.getItem("plan_seguridad"))
            ultimoRegistro = js.localStorage.getItem("ultimo_registro_crisis")
            self.datos.crisis = {
                "recursosGuardados": len(recursos),
                "planSeguridad": planSeguridad,
                "ultimoRegistro": ultimoRegistro
            }
        except Exception as e:
            pass
        
        try:
            cuestionarios = json.loads(js.localStorage.getItem("cuestionarios_resultados") or "[]")
            respuestas = json.loads(js.localStorage.getItem("cuestionarios_respuestas") or "{}")
            self.datos.cuestionarios = {
                "totalRealizados": len(cuestionarios),
                "ultimoResultado": cuestionarios[0] if cuestionarios else None,
                "promedioGeneral": self.calcularPromedioCuestionarios(cuestionarios),
                "resultados": respuestas
            }
        except Exception as e:
            pass
        
        try:
            biblioteca = json.loads(js.localStorage.getItem("biblioteca_personal") or "[]")
            self.datos.biblioteca = {
                "totalLibros": len(biblioteca),
                "leidos": len([l for l in biblioteca if l.get("leido", False)]),
                "favoritos": len([l for l in biblioteca if l.get("favorito", False)]),
                "ultimoAgregado": biblioteca[0].get("titulo") if biblioteca else None
            }
        except Exception as e:
            pass
        
        try:
            logros = json.loads(js.localStorage.getItem("logros_obtenidos") or "[]")
            self.datos.logros = {
                "total": len(logros),
                "recientes": logros[:3],
                "nivelLogros": len(logros) // 10 + 1
            }
        except Exception as e:
            pass
        
        try:
            reportes = json.loads(js.localStorage.getItem("reportes_semanales") or "{}")
            ultimoReporte = js.localStorage.getItem("ultimo_reporte_generado")
            self.datos.reportes = {
                "estadisticasSemanales": reportes,
                "ultimoReporte": ultimoReporte
            }
        except Exception as e:
            pass
        
        try:
            mapas = json.loads(js.localStorage.getItem("mapas_mentales") or "[]")
            self.datos.mapas = {
                "total": len(mapas),
                "ultimoCreado": mapas[0].get("nombre") if mapas else None,
                "favoritos": len([m for m in mapas if m.get("favorito", False)])
            }
        except Exception as e:
            pass
        
        try:
            syncData = json.loads(js.localStorage.getItem("sincronizacion_global") or "{}")
            self.datos.database = {
                "ultimaSincronizacion": syncData.get("ultimaSincronizacion"),
                "datosSincronizados": len(syncData)
            }
        except Exception as e:
            pass
        
        try:
            plugins = json.loads(js.localStorage.getItem("reprompt_plugins") or "[]")
            self.datos.plugins = {
                "instalados": len(plugins),
                "activos": len([p for p in plugins if p.get("activo", False)]),
                "lista": [p.get("nombre") for p in plugins]
            }
        except Exception as e:
            pass
        
        try:
            libro = json.loads(js.localStorage.getItem("reprompt_libro_v3") or "{}")
            entradas = libro.get("entradas", [])
            self.datos.libroVida = {
                "totalEntradas": len(entradas),
                "porTipo": {
                    "texto": len([e for e in entradas if e.get("tipo") == "texto"]),
                    "audio": len([e for e in entradas if e.get("tipo") == "audio"]),
                    "video": len([e for e in entradas if e.get("tipo") == "video"]),
                    "conversacion": len([e for e in entradas if e.get("tipo") == "conversacion"])
                },
                "ultimaEntrada": entradas[0].get("fecha") if entradas else None
            }
        except Exception as e:
            pass
        
        self.actualizarEstadisticasUsuario()
        print("✅ Datos de los 18 sistemas cargados")
    
    def calcularRachaEjercicios(self, ejercicios):
        racha = 0
        hoy = datetime.now().strftime("%Y-%m-%d")
        fechaActual = datetime.strptime(hoy, "%Y-%m-%d")
        
        for i in range(30):
            fechaStr = fechaActual.strftime("%Y-%m-%d")
            hayEjercicio = any(e.get("fecha") == fechaStr for e in ejercicios)
            if hayEjercicio:
                racha += 1
            else:
                break
            fechaActual -= timedelta(days=1)
        return racha
    
    def calcularPromedioSueno(self, sueno, dias):
        ultimosDias = sueno[:dias]
        if not ultimosDias:
            return 0
        suma = sum(s.get("horas", 0) for s in ultimosDias)
        return round(suma / len(ultimosDias))
    
    def calcularRachaSueno(self, sueno):
        racha = 0
        hoy = datetime.now().strftime("%Y-%m-%d")
        fechaActual = datetime.strptime(hoy, "%Y-%m-%d")
        
        for i in range(30):
            fechaStr = fechaActual.strftime("%Y-%m-%d")
            registro = next((s for s in sueno if s.get("fecha") == fechaStr), None)
            if registro and registro.get("horas", 0) >= 7:
                racha += 1
            else:
                break
            fechaActual -= timedelta(days=1)
        return racha
    
    def calcularPromedioCuestionarios(self, cuestionarios):
        if not cuestionarios:
            return 0
        suma = sum(c.get("puntaje", 0) for c in cuestionarios)
        return round(suma / len(cuestionarios))
    
    def actualizarEstadisticasUsuario(self):
        self.usuario.estadisticas = {
            "metasCompletadasHistorial": self.datos.metas.get("completadas", 0),
            "habitosMantenidos": self.datos.habitos.get("activos", 0),
            "diasConsecutivos": self.datos.habitos.get("rachaTotal", 0),
            "reflexionesCompletadas": self.datos.libroVida.get("totalEntradas", 0),
            "nivelAlcanzado": self.memoria.evolucion.nivelActual,
            "ejerciciosCompletados": self.datos.ejercicios.get("total", 0),
            "horasSuenoPromedio": self.datos.sueno.get("promedioSemana", 0)
        }
    
    def obtenerResumenCompleto(self):
        self.cargarTodosLosDatos()
        return {
            "usuario": {
                "nombre": self.usuario.nombre,
                "nivel": self.memoria.evolucion.nivelActual,
                "xp": self.memoria.evolucion.xpTotal,
                "arquetipo": self.usuario.arquetipo,
                "perfil": {
                    "personalidad": self.memoria.perfilPsicologico.personalidad,
                    "inteligenciaEmocional": self.memoria.perfilPsicologico.inteligenciaEmocional,
                    "estiloAprendizaje": self.memoria.perfilPsicologico.estiloAprendizaje,
                    "fortalezas": self.memoria.perfilPsicologico.fortalezas,
                    "mindset": self.memoria.perfilPsicologico.mindset,
                    "proposito": self.memoria.perfilPsicologico.proposito
                }
            },
            "estadisticas": self.usuario.estadisticas,
            "sistemas": {
                "metas": self.datos.metas,
                "habitos": self.datos.habitos,
                "ejercicios": self.datos.ejercicios,
                "sueno": self.datos.sueno,
                "musica": self.datos.musica,
                "comunidad": self.datos.comunidad,
                "libroVida": self.datos.libroVida,
                "logros": self.datos.logros,
                "cuestionarios": self.datos.cuestionarios,
                "biblioteca": self.datos.biblioteca,
                "profesionales": self.datos.profesionales,
                "crisis": self.datos.crisis,
                "mapas": self.datos.mapas,
                "plugins": self.datos.plugins
            },
            "organizacion": self.organizacion.hoy,
            "fecha": datetime.now().isoformat()
        }
    
    # ==================== SISTEMA DE ACCIONES ====================
    
    async def ejecutarAccion(self, texto, analisis):
        textoLower = texto.lower()
        resultado = {
            "accion": None,
            "exito": False,
            "mensaje": None,
            "datos": None
        }
        
        # 1. CREAR METAS
        match = re.search(r'(?:crear|agregar|nueva|registrar|establecer|definir|iniciar|empezar)\s*(?:una\s*)?meta(?:\s*llamada\s*)?["\']?([^"\'\n]{3,})["\']?', texto, re.IGNORECASE)
        if match:
            nombreMeta = match.group(1).strip()
            
            resultado["accion"] = "crear_meta"
            resultado["datos"] = {"nombre": nombreMeta}
            resultado["exito"] = True
            resultado["mensaje"] = f"🎯 Meta '{nombreMeta}' creada con éxito, {self.usuario.nombre}. ¡Estoy aquí para apoyarte a lograrla!"
            
            try:
                metas = json.loads(js.localStorage.getItem("metas_proyectos_v6") or "[]")
                nuevaMeta = {
                    "id": int(time.time() * 1000),
                    "nombre": nombreMeta,
                    "completado": False,
                    "progreso": 0,
                    "fechaCreacion": datetime.now().isoformat()
                }
                metas.append(nuevaMeta)
                js.localStorage.setItem("metas_proyectos_v6", json.dumps(metas))
                self.ganarXP(10, "Meta creada")
            except Exception as e:
                resultado["mensaje"] = f"❌ Error al crear la meta, {self.usuario.nombre}: {e}"
                resultado["exito"] = False
            return resultado
        
        # 2. CREAR HÁBITOS
        match = re.search(r'(?:crear|agregar|nuevo|establecer|iniciar)\s*(?:un\s*)?h(á|a)bito(?:\s*de\s*)?["\']?([^"\'\n]{3,})["\']?', texto, re.IGNORECASE)
        if match:
            nombreHabito = match.group(2) or match.group(1)
            nombreLimpio = nombreHabito.replace("á", "a").strip()
            
            resultado["accion"] = "crear_habito"
            resultado["datos"] = {"nombre": nombreLimpio}
            resultado["exito"] = True
            resultado["mensaje"] = f"🔄 Hábito '{nombreLimpio}' creado, {self.usuario.nombre}. ¡A practicarlo cada día!"
            
            try:
                habitos = json.loads(js.localStorage.getItem("habitos_v4") or "[]")
                nuevoHabito = {
                    "id": int(time.time() * 1000),
                    "nombre": nombreLimpio,
                    "racha": 0,
                    "completados": [],
                    "activo": True,
                    "frecuencia": 1,
                    "fechaCreacion": datetime.now().isoformat()
                }
                habitos.append(nuevoHabito)
                js.localStorage.setItem("habitos_v4", json.dumps(habitos))
                self.ganarXP(8, "Hábito creado")
            except Exception as e:
                resultado["mensaje"] = f"❌ Error al crear el hábito, {self.usuario.nombre}: {e}"
                resultado["exito"] = False
            return resultado
        
        # 3. REGISTRAR EJERCICIO
        match = re.search(r'(?:registrar|he hecho|hice|realic[ée]|hoy hice)\s*(ejercicio|cardio|running|caminata|yoga|pesas|gimnasio|natación|bici|corr[íi]|trot[ée]|camin[ée])(?:\s*(\d+)\s*(minutos?|min)?)?', texto, re.IGNORECASE)
        if match:
            tipoEjercicio = match.group(1)
            minutos = int(match.group(2)) if match.group(2) else 30
            calorias = round(minutos * 5)
            
            resultado["accion"] = "registrar_ejercicio"
            resultado["datos"] = {"tipo": tipoEjercicio, "minutos": minutos, "calorias": calorias}
            resultado["exito"] = True
            resultado["mensaje"] = f"🏃 ¡Excelente, {self.usuario.nombre}! Registraste {minutos} minutos de {tipoEjercicio}, quemando aproximadamente {calorias} kcal. ¡Sigue así!"
            
            try:
                ejercicios = json.loads(js.localStorage.getItem("ejercicios_v4") or "[]")
                hoy = datetime.now().strftime("%Y-%m-%d")
                nuevoEjercicio = {
                    "id": int(time.time() * 1000),
                    "fecha": hoy,
                    "tipo": tipoEjercicio,
                    "duracion": minutos,
                    "calorias": calorias,
                    "timestamp": datetime.now().isoformat()
                }
                ejercicios.insert(0, nuevoEjercicio)
                js.localStorage.setItem("ejercicios_v4", json.dumps(ejercicios))
                self.ganarXP(15, "Ejercicio registrado")
            except Exception as e:
                resultado["mensaje"] = f"❌ Error al registrar ejercicio, {self.usuario.nombre}: {e}"
                resultado["exito"] = False
            return resultado
        
        # 4. REGISTRAR SUEÑO
        match = re.search(r'(?:dorm[íi]|he dormido|registrar sueño|anoche dorm[íi])\s*(\d+(?:\.\d+)?)\s*(?:horas?|hrs?)(?:\s*(?:calidad\s*)?(\d+))?', texto, re.IGNORECASE)
        if match:
            horas = float(match.group(1))
            calidad = int(match.group(2)) if match.group(2) else 7
            
            resultado["accion"] = "registrar_sueno"
            resultado["datos"] = {"horas": horas, "calidad": calidad}
            resultado["exito"] = True
            
            mensaje = f"😴 Gracias por compartir, {self.usuario.nombre}. Registraste {horas} horas de sueño. "
            if calidad >= 8:
                mensaje += "¡Excelente calidad! 🎉"
            elif calidad >= 5:
                mensaje += "Calidad aceptable. ¿Puedes mejorar algo?"
            else:
                mensaje += "La calidad fue baja. ¿Hubo algo que te interrumpiera?"
            
            resultado["mensaje"] = mensaje
            
            try:
                sueno = json.loads(js.localStorage.getItem("sueno_v4") or "[]")
                hoy = datetime.now().strftime("%Y-%m-%d")
                nuevoSueno = {
                    "id": int(time.time() * 1000),
                    "fecha": hoy,
                    "horas": horas,
                    "calidad": calidad,
                    "timestamp": datetime.now().isoformat()
                }
                sueno.insert(0, nuevoSueno)
                js.localStorage.setItem("sueno_v4", json.dumps(sueno))
                self.ganarXP(10, "Sueño registrado")
            except Exception as e:
                resultado["mensaje"] = f"❌ Error al registrar sueño, {self.usuario.nombre}: {e}"
                resultado["exito"] = False
            return resultado
        
        # 5. REGISTRAR EMOCIÓN
        match = re.search(r'(?:me siento|estoy|me encuentro|registrar emoción|hoy me siento)\s+(feliz|triste|enojado|ansioso|motivado|cansado|agradecido|emocionado|tranquilo|estresado|contento|preocupado|esperanzado|orgulloso)', texto, re.IGNORECASE)
        if match:
            emocion = match.group(1)
            
            resultado["accion"] = "registrar_emocion"
            resultado["datos"] = {"emocion": emocion}
            resultado["exito"] = True
            
            emojis = {
                "feliz": "😊", "triste": "😢", "enojado": "😤",
                "ansioso": "😰", "motivado": "💪", "cansado": "😴",
                "agradecido": "🙏", "emocionado": "🤩", "tranquilo": "😌",
                "estresado": "😫", "contento": "😊", "preocupado": "😟",
                "esperanzado": "🌟", "orgulloso": "🦁"
            }
            resultado["mensaje"] = f"{emojis.get(emocion, '🧠')} Gracias por compartir, {self.usuario.nombre}. Registraste que te sientes {emocion}. Reconocerlo es el primer paso para gestionarlo."
            
            try:
                emociones = json.loads(js.localStorage.getItem("estados_animo") or "[]")
                nuevaEmocion = {
                    "id": int(time.time() * 1000),
                    "emocion": emocion,
                    "fecha": datetime.now().isoformat()
                }
                emociones.insert(0, nuevaEmocion)
                js.localStorage.setItem("estados_animo", json.dumps(emociones[:50]))
                self.ganarXP(5, "Emoción registrada")
            except Exception as e:
                resultado["mensaje"] = f"❌ Error al registrar emoción, {self.usuario.nombre}: {e}"
                resultado["exito"] = False
            return resultado
        
        # 6. AGREGAR AL LIBRO DE VIDA
        match = re.search(r'(?:guardar|agregar|escribir|anotar|registrar)\s*(?:en mi libro|una reflexión|un pensamiento|esto|en el libro de vida)\s*["\']?([^"\'\n]{10,})["\']?', texto, re.IGNORECASE)
        if match and len(texto) > 15:
            entrada = match.group(1) or texto
            
            resultado["accion"] = "agregar_libro"
            resultado["datos"] = {"entrada": entrada}
            resultado["exito"] = True
            resultado["mensaje"] = f"📖 He guardado tu reflexión en el Libro de Vida, {self.usuario.nombre}. Sigue escribiendo, cada palabra construye tu camino."
            
            try:
                libro = json.loads(js.localStorage.getItem("reprompt_libro_v3") or '{"entradas":[]}')
                nuevaEntrada = {
                    "id": int(time.time() * 1000),
                    "fecha": datetime.now().isoformat(),
                    "tipo": "texto",
                    "contenido": entrada,
                    "emocion": analisis.get("emocionPrincipal", "reflexivo")
                }
                libro["entradas"].insert(0, nuevaEntrada)
                js.localStorage.setItem("reprompt_libro_v3", json.dumps(libro))
                self.ganarXP(8, "Entrada en libro")
            except Exception as e:
                resultado["mensaje"] = f"❌ Error al guardar en el libro, {self.usuario.nombre}: {e}"
                resultado["exito"] = False
            return resultado
        
        # 7. COMPLETAR HÁBITO
        match = re.search(r'(?:complet[ée]|hice|realic[ée]|termin[ée]|cumpl[íi] con)\s*(?:mi\s*)?h(á|a)bito(?:\s*de\s*)?["\']?([^"\'\n]{3,})["\']?', texto, re.IGNORECASE)
        if match:
            nombreHabito = (match.group(2) or match.group(1)).strip()
            nombreLimpio = nombreHabito.replace("á", "a").lower()
            
            resultado["accion"] = "completar_habito"
            resultado["datos"] = {"nombre": nombreLimpio}
            resultado["exito"] = True
            
            try:
                habitos = json.loads(js.localStorage.getItem("habitos_v4") or "[]")
                habito = None
                for h in habitos:
                    if nombreLimpio in h.get("nombre", "").lower() or h.get("nombre", "").lower() in nombreLimpio:
                        habito = h
                        break
                
                if habito:
                    hoy = datetime.now().strftime("%Y-%m-%d")
                    if "completados" not in habito:
                        habito["completados"] = []
                    if hoy not in habito["completados"]:
                        habito["completados"].append(hoy)
                        habito["racha"] = habito.get("racha", 0) + 1
                        js.localStorage.setItem("habitos_v4", json.dumps(habitos))
                        self.ganarXP(10, "Hábito completado")
                        resultado["mensaje"] = f"✅ ¡Felicidades, {self.usuario.nombre}! Completaste '{habito['nombre']}'. Racha actual: {habito['racha']} días 🔥"
                    else:
                        resultado["mensaje"] = f"✅ Ya habías completado '{habito['nombre']}' hoy, {self.usuario.nombre}. ¡Doble mérito!"
                else:
                    resultado["mensaje"] = f"❌ No encontré el hábito '{nombreLimpio}', {self.usuario.nombre}. ¿Quieres crearlo? Dime 'Crear hábito de {nombreLimpio}'"
                    resultado["exito"] = False
            except Exception as e:
                resultado["mensaje"] = f"❌ Error al completar hábito, {self.usuario.nombre}: {e}"
                resultado["exito"] = False
            return resultado
        
        # 8. ACTUALIZAR PROGRESO DE META
        match = re.search(r'(?:avanc[ée]|progreso|actualizar|voy)\s*(?:mi\s*)?meta\s*["\']?([^"\'\n]{3,})["\']?\s*(?:a|al|va)\s*(\d+)%', texto, re.IGNORECASE)
        if match:
            nombreMeta = match.group(1).strip()
            progreso = int(match.group(2))
            
            resultado["accion"] = "actualizar_meta"
            resultado["datos"] = {"nombre": nombreMeta, "progreso": progreso}
            resultado["exito"] = True
            
            try:
                metas = json.loads(js.localStorage.getItem("metas_proyectos_v6") or "[]")
                meta = None
                for m in metas:
                    if nombreMeta.lower() in m.get("nombre", "").lower():
                        meta = m
                        break
                
                if meta:
                    meta["progreso"] = progreso
                    if progreso >= 100:
                        meta["completado"] = True
                        resultado["mensaje"] = f"🎉 ¡FELICIDADES, {self.usuario.nombre}! Completaste la meta '{meta['nombre']}'. ¡Logro desbloqueado! 🏆"
                        self.ganarXP(25, "Meta completada")
                    else:
                        resultado["mensaje"] = f"🎯 ¡Qué bien, {self.usuario.nombre}! Actualicé '{meta['nombre']}' al {progreso}%. ¡Vas por buen camino!"
                        self.ganarXP(5, "Progreso de meta")
                    js.localStorage.setItem("metas_proyectos_v6", json.dumps(metas))
                else:
                    resultado["mensaje"] = f"❌ No encontré la meta '{nombreMeta}', {self.usuario.nombre}. ¿Quieres crearla?"
                    resultado["exito"] = False
            except Exception as e:
                resultado["mensaje"] = f"❌ Error al actualizar meta, {self.usuario.nombre}: {e}"
                resultado["exito"] = False
            return resultado
        
        return resultado
    
    async def procesarConAcciones(self, texto):
        analisis = self.analizarProfundamente(texto)
        accion = await self.ejecutarAccion(texto, analisis)
        
        if accion.get("exito") and accion.get("accion"):
            return {
                "texto": accion["mensaje"],
                "emocion": "positivo",
                "tipoRespuesta": "accion",
                "confianza": 0.98,
                "accionRealizada": accion["accion"],
                "datosAccion": accion["datos"]
            }
        
        return None
    
    # ==================== RESPUESTA PRINCIPAL CON CONTEXTO ====================
    
    async def respuestaSabia(self, analisis):
        # Buscar respuesta aprendida similar
        respuestaAprendida = self.aprendizaje.buscarRespuestaSimilar(analisis.get("original", ""))
        if respuestaAprendida and respuestaAprendida.get("confianza", 0) > 0.7:
            self.ganarXP(1, "Aprendizaje previo")
            return {"texto": respuestaAprendida.get("respuesta", ""), "tipo": "aprendido", "confianza": respuestaAprendida.get("confianza", 0)}
        
        textoLower = analisis.get("original", "").lower()
        
        # Detectar pregunta sobre el nombre
        if any(p in textoLower for p in ["cómo me llamo", "sabes mi nombre", "cuál es mi nombre", "dime mi nombre"]):
            nombreReal = self.memoria.informacionUsuario.nombre or self.usuario.nombre
            if nombreReal and nombreReal != "Usuario":
                return {
                    "texto": f"¡Claro que sí, {nombreReal}! Te llamas {nombreReal}. ¿Cómo podría olvidarlo? 😊",
                    "tipo": "nombre",
                    "confianza": 0.98
                }
            else:
                return {
                    "texto": "Aún no me has dicho tu nombre. ¿Cómo te llamas? Me encantaría saberlo.",
                    "tipo": "pregunta",
                    "confianza": 0.95
                }
        
        # Detectar cuando el usuario dice su nombre
        if any(p in textoLower for p in ["me llamo", "mi nombre es"]) or ("soy" in textoLower and "soy capaz" not in textoLower):
            nombreMatch = re.search(r'me llamo\s+([a-záéíóúñ]+)', analisis.get("original", ""), re.IGNORECASE)
            if not nombreMatch:
                nombreMatch = re.search(r'mi nombre es\s+([a-záéíóúñ]+)', analisis.get("original", ""), re.IGNORECASE)
            if not nombreMatch:
                nombreMatch = re.search(r'soy\s+([a-záéíóúñ]{3,})', analisis.get("original", ""), re.IGNORECASE)
            
            if nombreMatch and nombreMatch.group(1):
                nuevoNombre = nombreMatch.group(1).capitalize()
                self.usuario.nombre = nuevoNombre
                self.memoria.informacionUsuario.nombre = nuevoNombre
                self.guardarInformacionUsuario()
                
                try:
                    perfil = json.loads(js.localStorage.getItem("reprompt_perfil_v6") or "{}")
                    perfil["nombre"] = nuevoNombre
                    js.localStorage.setItem("reprompt_perfil_v6", json.dumps(perfil))
                except Exception as e:
                    pass
                
                return {
                    "texto": f"✨ ¡Encantado de conocerte, {nuevoNombre}! Es un placer acompañarte en tu camino de desarrollo personal. ¿En qué puedo ayudarte hoy?",
                    "emocion": "feliz",
                    "tipoRespuesta": "presentacion",
                    "confianza": 0.98
                }
        
        # Respuestas emocionales
        if analisis.get("emocionPrincipal") == "triste":
            sabio = random.choice(PENSAMIENTOS_SABIOS)
            return {"texto": f"💙 Entiendo, {self.usuario.nombre}. {sabio} ¿Quieres hablar de ello?", "tipo": "empatica", "confianza": 0.9}
        
        if analisis.get("emocionPrincipal") == "feliz":
            afirmacion = random.choice(AFIRMACIONES)
            self.ganarXP(3, "Emoción positiva")
            return {"texto": f"😊 ¡Qué bueno, {self.usuario.nombre}! {afirmacion} ¿Qué te tiene así de feliz?", "tipo": "motivacional", "confianza": 0.9}
        
        if analisis.get("emocionPrincipal") == "motivado":
            self.ganarXP(3, "Motivación")
            return {"texto": f"💪 ¡Esa energía es contagiosa, {self.usuario.nombre}! ¿Qué te tiene así de motivado?", "tipo": "motivacional", "confianza": 0.9}
        
        if analisis.get("emocionPrincipal") == "agradecido":
            return {"texto": f"🙏 Qué bonito, {self.usuario.nombre}. La gratitud transforma todo. ¿De qué te sientes agradecido/a hoy?", "tipo": "gratitud", "confianza": 0.95}
        
        if analisis.get("emocionPrincipal") == "ansioso":
            return {"texto": f"😌 Tranquilo/a, {self.usuario.nombre}. La ansiedad es solo una visita, no se queda para siempre. Respira profundo conmigo: inhala... exhala... ¿Hay algo específico que te preocupa?", "tipo": "calma", "confianza": 0.95}
        
        # Pregunta proactiva después de varias interacciones
        debePreguntar = len(self.memoria.conversaciones) > 3 and len(self.memoria.conversaciones) % 5 == 0 and len(self.memoria.preguntasRealizadas) < 15
        
        if debePreguntar:
            pregunta = self.obtenerPreguntaProactiva()
            self.memoria.ultimaPreguntaActiva = pregunta
            return {
                "texto": f"💭 Antes de continuar, {self.usuario.nombre}, me gustaría conocerte mejor: {pregunta}",
                "emocion": "curioso",
                "tipoRespuesta": "pregunta_proactiva",
                "confianza": 0.9
            }
        
        return {"texto": f"🌟 Cuéntame más, {self.usuario.nombre}. Estoy aquí para escucharte y ayudarte en tu camino.", "tipo": "general", "confianza": 0.7}
    
    # ==================== SISTEMA DE XP ====================
    
    def calcularNivelInicial(self):
        xp = self.memoria.evolucion.xpTotal
        if xp >= 1000:
            nivel = 5
        elif xp >= 600:
            nivel = 4
        elif xp >= 300:
            nivel = 3
        elif xp >= 100:
            nivel = 2
        else:
            nivel = 1
        
        self.memoria.evolucion.nivelActual = nivel
        print(f"🎯 Nivel: {nivel} - {PREGUNTAS_POR_NIVEL.get(f'nivel{nivel}', {}).get('nombre', 'Aprendiz')}")
    
    def calcularNivelPorXP(self, xp):
        if xp >= 1000:
            return 5
        elif xp >= 600:
            return 4
        elif xp >= 300:
            return 3
        elif xp >= 100:
            return 2
        return 1
    
    def ganarXP(self, cantidad, motivo):
        self.memoria.evolucion.xpTotal += cantidad
        print(f"📈 +{cantidad} XP ({motivo}) | Total: {self.memoria.evolucion.xpTotal} XP")
        self.guardarTodo()
        
        nuevoNivel = self.calcularNivelPorXP(self.memoria.evolucion.xpTotal)
        if nuevoNivel > self.memoria.evolucion.nivelActual:
            self.memoria.evolucion.nivelActual = nuevoNivel
            print(f"🎉 ¡FELICIDADES! Subiste al NIVEL {nuevoNivel} - {PREGUNTAS_POR_NIVEL.get(f'nivel{nuevoNivel}', {}).get('nombre', 'Explorador')} 🎉")
    
    # ==================== MÉTODO PRINCIPAL ====================
    
    async def preguntar(self, texto):
        self.cargarTodosLosDatos()
        
        # 1. DETECTAR MÚSICA
        musicaDetectada = self.detectarMusicaInteligente(texto)
        
        if musicaDetectada.get("esMusica"):
            print(f"🎵 COMANDO DE MÚSICA DETECTADO: {musicaDetectada.get('categoria', 'sin categoría')} - Texto: '{texto}'")
            
            if musicaDetectada.get("categoria"):
                self.reproducirMusica(musicaDetectada["categoria"])
                
                respuestas = {
                    "concentracion": f"🎵 ¡Perfecto, {self.usuario.nombre}! Poniendo música para concentración y estudio. 📚🎧",
                    "dormir": f"🎵 ¡Claro, {self.usuario.nombre}! Poniendo música relajante para dormir. 🌙😴",
                    "meditar": f"🎵 ¡Excelente, {self.usuario.nombre}! Poniendo música para meditar y encontrar paz interior. 🧘🎧",
                    "motivacion": f"🎵 ¡Vamos, {self.usuario.nombre}! Poniendo música motivacional para darlo todo. 💪🎧"
                }
                
                respuestaTexto = respuestas.get(musicaDetectada["categoria"], f"🎵 Reproduciendo música, {self.usuario.nombre}. ¡Disfrútala! 🎧")
                
                await self.aprender(int(time.time() * 1000), texto, respuestaTexto, "positivo", None)
                
                return {
                    "texto": respuestaTexto,
                    "emocion": "positivo",
                    "tipoRespuesta": "musica",
                    "confianza": 0.99,
                    "accionRealizada": "reproducir_musica",
                    "datosContexto": self.obtenerResumenCompleto(),
                    "aprendizaje": {"nivel": self.memoria.evolucion.nivelActual, "xp": self.memoria.evolucion.xpTotal}
                }
            else:
                respuesta = f"🎵 ¿Qué tipo de música quieres escuchar, {self.usuario.nombre}? Tengo para: concentración 📚 (estudio/trabajo), dormir 😴 (relajación/lluvia), meditar 🧘 (zen/calma) o motivación 💪 (energía/positiva)."
                await self.aprender(int(time.time() * 1000), texto, respuesta, "neutral", None)
                return {
                    "texto": respuesta,
                    "emocion": "neutral",
                    "tipoRespuesta": "musica",
                    "confianza": 0.95,
                    "datosContexto": self.obtenerResumenCompleto(),
                    "aprendizaje": {"nivel": self.memoria.evolucion.nivelActual, "xp": self.memoria.evolucion.xpTotal}
                }
        
        # 2. DETECTAR INTENCIÓN
        intencion = self.detectarIntencion(texto)
        
        # 3. PROCESAR SEGÚN INTENCIÓN
        
        # CRISIS (máxima prioridad)
        if intencion.get("intencion") == "crisis_ayuda" or any(p in texto.lower() for p in ["crisis", "emergencia", "no estoy bien", "ayuda"]):
            respuestaCrisis = await self.responderCrisis(texto)
            if respuestaCrisis:
                await self.aprender(int(time.time() * 1000), texto, respuestaCrisis["texto"], "triste", None)
                return respuestaCrisis
        
        # METAS
        if intencion.get("intencion") == "consultar_metas" or any(p in texto.lower() for p in ["mis metas", "revisa metas"]):
            respuestaMetas = await self.responderConsultaMetas()
            if respuestaMetas:
                await self.aprender(int(time.time() * 1000), texto, respuestaMetas["texto"], "positivo", None)
                return respuestaMetas
        
        # PROGRESO GENERAL
        if intencion.get("intencion") == "consultar_progreso" or any(p in texto.lower() for p in ["mi progreso", "cómo voy"]):
            respuestaProgreso = await self.responderConsultaProgreso()
            if respuestaProgreso:
                await self.aprender(int(time.time() * 1000), texto, respuestaProgreso["texto"], "positivo", None)
                return respuestaProgreso
        
        # HÁBITOS
        if intencion.get("intencion") == "consultar_habitos" or any(p in texto.lower() for p in ["mis hábitos", "mis habitos"]):
            respuestaHabitos = await self.responderConsultaHabitos()
            if respuestaHabitos:
                await self.aprender(int(time.time() * 1000), texto, respuestaHabitos["texto"], "neutral", None)
                return respuestaHabitos
        
        # EJERCICIOS
        if intencion.get("intencion") == "consultar_ejercicios" or any(p in texto.lower() for p in ["mis ejercicios", "cuánto he entrenado"]):
            respuestaEjercicios = await self.responderConsultaEjercicios()
            if respuestaEjercicios:
                await self.aprender(int(time.time() * 1000), texto, respuestaEjercicios["texto"], "positivo", None)
                return respuestaEjercicios
        
        # SUEÑO
        if intencion.get("intencion") == "consultar_sueno" or any(p in texto.lower() for p in ["mi sueño", "cómo he dormido"]):
            respuestaSueno = await self.responderConsultaSueno()
            if respuestaSueno:
                await self.aprender(int(time.time() * 1000), texto, respuestaSueno["texto"], "neutral", None)
                return respuestaSueno
        
        # LOGROS
        if intencion.get("intencion") == "consultar_logros" or any(p in texto.lower() for p in ["mis logros", "mis medallas"]):
            respuestaLogros = await self.responderConsultaLogros()
            if respuestaLogros:
                await self.aprender(int(time.time() * 1000), texto, respuestaLogros["texto"], "positivo", None)
                return respuestaLogros
        
        # COMUNIDAD
        if intencion.get("intencion") == "consultar_comunidad" or "comunidad" in texto.lower():
            respuestaComunidad = await self.responderConsultaComunidad()
            if respuestaComunidad:
                await self.aprender(int(time.time() * 1000), texto, respuestaComunidad["texto"], "neutral", None)
                return respuestaComunidad
        
        # BIBLIOTECA
        if intencion.get("intencion") == "consultar_biblioteca" or any(p in texto.lower() for p in ["mis libros", "biblioteca"]):
            respuestaBiblioteca = await self.responderConsultaBiblioteca()
            if respuestaBiblioteca:
                await self.aprender(int(time.time() * 1000), texto, respuestaBiblioteca["texto"], "neutral", None)
                return respuestaBiblioteca
        
        # MAPAS
        if intencion.get("intencion") == "consultar_mapas" or any(p in texto.lower() for p in ["mapas mentales", "mis mapas"]):
            respuestaMapas = await self.responderConsultaMapas()
            if respuestaMapas:
                await self.aprender(int(time.time() * 1000), texto, respuestaMapas["texto"], "neutral", None)
                return respuestaMapas
        
        # PLUGINS
        if intencion.get("intencion") == "gestionar_plugins" or any(p in texto.lower() for p in ["plugins", "tienda"]):
            respuestaPlugins = await self.responderConsultaPlugins()
            if respuestaPlugins:
                await self.aprender(int(time.time() * 1000), texto, respuestaPlugins["texto"], "neutral", None)
                return respuestaPlugins
        
        # CUESTIONARIOS
        if intencion.get("intencion") == "consultar_cuestionarios" or any(p in texto.lower() for p in ["cuestionarios", "test de"]):
            respuestaCuestionarios = await self.responderConsultaCuestionarios()
            if respuestaCuestionarios:
                await self.aprender(int(time.time() * 1000), texto, respuestaCuestionarios["texto"], "neutral", None)
                return respuestaCuestionarios
        
        # BIENESTAR EMOCIONAL
        respuestaEmocional = await self.responderBienestarEmocional(texto, None)
        if respuestaEmocional:
            await self.aprender(int(time.time() * 1000), texto, respuestaEmocional["texto"], respuestaEmocional.get("emocion"), None)
            return respuestaEmocional
        
        # PERFIL
        if intencion.get("intencion") == "consultar_perfil" or any(p in texto.lower() for p in ["mi perfil", "quién soy"]):
            respuestaPerfil = await self.responderPerfil()
            if respuestaPerfil:
                await self.aprender(int(time.time() * 1000), texto, respuestaPerfil["texto"], "neutral", None)
                return respuestaPerfil
        
        # AYUDA
        if intencion.get("intencion") == "ayuda" or any(p in texto.lower() for p in ["qué puedes hacer", "ayuda", "cómo funcionas"]):
            respuestaAyuda = await self.responderAyuda()
            if respuestaAyuda:
                await self.aprender(int(time.time() * 1000), texto, respuestaAyuda["texto"], "neutral", None)
                return respuestaAyuda
        
        # 4. PROCESAR ACCIONES
        accionResultado = await self.procesarConAcciones(texto)
        if accionResultado:
            await self.aprender(int(time.time() * 1000), texto, accionResultado["texto"], accionResultado.get("emocion"), None)
            return accionResultado
        
        # 5. PROGRAMACIÓN
        if intencion.get("intencion") == "programacion" or any(p in texto.lower() for p in ["código", "programar"]):
            resultado = self.aprendizaje.consultarProgramacion(texto)
            if resultado and resultado.get("codigo"):
                nombreLenguaje = {"java": "Java", "javascript": "JavaScript", "python": "Python"}.get(resultado["lenguaje"], resultado["lenguaje"])
                mensaje = f"💻 **{nombreLenguaje} - {resultado['tema']}**\n\n📝 **Ejemplo de código:**\n`{resultado['lenguaje']}\n{resultado['codigo']}\n`\n💡 ¿Necesitas más ejemplos, {self.usuario.nombre}?"
                self.ganarXP(5, "Programación")
                await self.aprender(int(time.time() * 1000), texto, mensaje, "neutral", None)
                return {
                    "texto": mensaje,
                    "emocion": "neutral",
                    "tipoRespuesta": "programacion",
                    "confianza": 0.95,
                    "datosContexto": self.obtenerResumenCompleto()
                }
        
        # 6. SALUDOS
        textoLower = texto.lower()
        saludosSimples = ["hola", "buenos días", "buenas tardes", "buenas noches", "hey", "qué tal", "saludos"]
        esSaludoSimple = any(textoLower.strip() == s or textoLower.strip().startswith(s + " ") for s in saludosSimples)
        
        if esSaludoSimple:
            saludos = [
                f"✨ ¡Hola, {self.usuario.nombre}! ¿Cómo estás hoy?",
                f"👋 ¡Hey, {self.usuario.nombre}! ¿Qué tal va todo?",
                f"🌟 ¡Buenas, {self.usuario.nombre}! ¿En qué puedo ayudarte?",
                f"💫 ¡Hola de nuevo, {self.usuario.nombre}! ¿Cómo va tu día?"
            ]
            self.ganarXP(1, "Saludo")
            respuesta = random.choice(saludos)
            await self.aprender(int(time.time() * 1000), texto, respuesta, "positivo", None)
            return {
                "texto": respuesta,
                "emocion": "positivo",
                "tipoRespuesta": "saludo",
                "confianza": 0.98,
                "datosContexto": self.obtenerResumenCompleto()
            }
        
        # 7. USAR GEMINI (si está disponible)
        respuestaFinal = None
        
        if self.gemini.disponible and len(texto) > 3:
            analisis = self.analizarProfundamente(texto)
            respuestaGemini = await self.generarConGemini(analisis)
            if respuestaGemini:
                respuestaFinal = respuestaGemini
        
        # 8. FALLBACK: RESPUESTA SABIA LOCAL
        if not respuestaFinal:
            analisis = self.analizarProfundamente(texto)
            respuestaFinal = await self.respuestaSabia(analisis)
        
        await self.aprender(int(time.time() * 1000), texto, respuestaFinal.get("texto", ""), respuestaFinal.get("emocion", "neutral"), None)
        
        return {
            "texto": respuestaFinal.get("texto", ""),
            "emocion": respuestaFinal.get("emocion", "neutral"),
            "tipoRespuesta": respuestaFinal.get("tipoRespuesta", "general"),
            "confianza": respuestaFinal.get("confianza", 0.85),
            "datosContexto": self.obtenerResumenCompleto(),
            "aprendizaje": {"nivel": self.memoria.evolucion.nivelActual, "xp": self.memoria.evolucion.xpTotal}
        }
    
    async def aprender(self, conversacionId, pregunta, respuesta, emocion, feedback=None):
        conversacion = {
            "id": conversacionId,
            "pregunta": pregunta,
            "respuesta": respuesta,
            "emocion": emocion,
            "feedback": feedback,
            "timestamp": int(time.time() * 1000)
        }
        self.memoria.conversaciones.insert(0, conversacion)
        if len(self.memoria.conversaciones) > 100:
            self.memoria.conversaciones.pop()
        
        if feedback == "positivo":
            self.memoria.evolucion.feedbackPositivo += 1
            self.ganarXP(2, "Feedback positivo")
        
        if feedback == "positivo":
            self.aprendizaje.memoria["aciertos"] += 1
            self.aprendizaje.memoria["preguntasRespondidas"].insert(0, {
                "pregunta": pregunta,
                "respuesta": respuesta,
                "feedback": feedback,
                "timestamp": int(time.time() * 1000)
            })
            palabras = self.aprendizaje._extraerPalabrasClave(pregunta)
            for palabra in palabras:
                self.aprendizaje.aprenderPalabra(palabra, "conversacion")
        elif feedback == "negativo":
            self.aprendizaje.memoria["errores"] += 1
        
        if len(self.aprendizaje.memoria["preguntasRespondidas"]) > 100:
            self.aprendizaje.memoria["preguntasRespondidas"].pop()
        self.aprendizaje.guardar()
        
        self.memoria.evolucion.totalInteracciones += 1
        self.ganarXP(1, "Interacción")
        self.guardarTodo()
    
    def limpiarRespuesta(self, texto):
        if not texto:
            return ""
        return re.sub(r'\*\*|\*|__|_|', "", texto).replace("\s+", " ").strip()
    
    def cargarTodo(self):
        try:
            guardado = js.localStorage.getItem("reprompt_aprendizaje_v24")
            if guardado:
                data = json.loads(guardado)
                if "memoria" in data:
                    for key, value in data["memoria"].items():
                        if hasattr(self.memoria, key):
                            setattr(self.memoria, key, value)
                if "usuario" in data:
                    for key, value in data["usuario"].items():
                        if hasattr(self.usuario, key):
                            setattr(self.usuario, key, value)
        except Exception as e:
            pass
        
        infoGuardada = js.localStorage.getItem("reprompt_usuario_info")
        if infoGuardada:
            try:
                info = json.loads(infoGuardada)
                for key, value in info.items():
                    if hasattr(self.memoria.informacionUsuario, key):
                        setattr(self.memoria.informacionUsuario, key, value)
                if info.get("nombre") and info.get("nombre") != "Usuario":
                    self.usuario.nombre = info.get("nombre")
            except Exception as e:
                pass
    
    def guardarTodo(self):
        try:
            js.localStorage.setItem("reprompt_aprendizaje_v24", json.dumps({
                "memoria": {
                    "conversaciones": self.memoria.conversaciones,
                    "respuestasExitosas": self.memoria.respuestasExitosas,
                    "respuestasFallidas": self.memoria.respuestasFallidas,
                    "reflexionesProfundas": self.memoria.reflexionesProfundas,
                    "momentosClave": self.memoria.momentosClave,
                    "preguntasRealizadas": list(self.memoria.preguntasRealizadas),
                    "fechaUltimaPregunta": self.memoria.fechaUltimaPregunta,
                    "ultimaPreguntaActiva": self.memoria.ultimaPreguntaActiva,
                    "ultimoTema": self.memoria.ultimoTema,
                    "evolucion": {
                        "generacion": self.memoria.evolucion.generacion,
                        "nivelSabiduria": self.memoria.evolucion.nivelSabiduria,
                        "totalInteracciones": self.memoria.evolucion.totalInteracciones,
                        "feedbackPositivo": self.memoria.evolucion.feedbackPositivo,
                        "feedbackNegativo": self.memoria.evolucion.feedbackNegativo,
                        "metasPropuestas": self.memoria.evolucion.metasPropuestas,
                        "habitosSugeridos": self.memoria.evolucion.habitosSugeridos,
                        "reflexionesGeneradas": self.memoria.evolucion.reflexionesGeneradas,
                        "momentosInspiracion": self.memoria.evolucion.momentosInspiracion,
                        "xpTotal": self.memoria.evolucion.xpTotal,
                        "nivelActual": self.memoria.evolucion.nivelActual,
                        "nivelMaximoAlcanzado": self.memoria.evolucion.nivelMaximoAlcanzado,
                        "desbloqueos": self.memoria.evolucion.desbloqueos,
                        "hitos": self.memoria.evolucion.hitos
                    }
                },
                "usuario": {
                    "nombre": self.usuario.nombre,
                    "nivel": self.usuario.nivel,
                    "xp": self.usuario.xp,
                    "racha": self.usuario.racha,
                    "emocionPredominante": self.usuario.emocionPredominante,
                    "arquetipo": self.usuario.arquetipo,
                    "valores": self.usuario.valores,
                    "proposito": self.usuario.proposito,
                    "id": self.usuario.id,
                    "patronesPersonales": self.usuario.patronesPersonales,
                    "estadisticas": self.usuario.estadisticas
                }
            }))
        except Exception as e:
            pass
        self.guardarInformacionUsuario()
        self.aprendizaje.guardar()
    
    def cargarDatosReprompt(self):
        try:
            metas = json.loads(js.localStorage.getItem("metas_proyectos_v6") or "[]")
            self.datos.metas["activas"] = [m for m in metas if not m.get("completado", False)]
            self.datos.metas["completadas"] = len([m for m in metas if m.get("completado", False)])
        except Exception as e:
            pass
        
        try:
            perfil = json.loads(js.localStorage.getItem("reprompt_perfil_v6") or "{}")
            self.usuario.nombre = perfil.get("nombre", "Usuario")
        except Exception as e:
            pass
    
    def inicializarOrganizacionDiaria(self):
        hoy = datetime.now().strftime("%Y-%m-%d")
        if self.organizacion.hoy.get("fecha") != hoy:
            self.organizacion.hoy = {
                "fecha": hoy,
                "intencion": None,
                "prioridades": [],
                "completadas": [],
                "aprendizaje": None,
                "gratitud": None,
                "energia": 0,
                "estadoAnimo": None,
                "reflexionDelDia": None
            }
            self.guardarOrganizacion()
    
    def guardarOrganizacion(self):
        try:
            js.localStorage.setItem("reprompt_organizacion_v24", json.dumps({
                "hoy": self.organizacion.hoy
            }))
        except Exception as e:
            pass
    
    def cargarOrganizacion(self):
        try:
            guardado = js.localStorage.getItem("reprompt_organizacion_v24")
            if guardado:
                data = json.loads(guardado)
                self.organizacion.hoy = data.get("hoy", self.organizacion.hoy)
        except Exception as e:
            pass
        self.inicializarOrganizacionDiaria()
    
    def detectarArquetipo(self):
        self.usuario.arquetipo = "buscador"
    
    def establecerIntencion(self, intencion):
        self.organizacion.hoy["intencion"] = intencion
        self.guardarOrganizacion()
        self.ganarXP(5, "Intención")
        return f"✨ Intención registrada, {self.usuario.nombre}: '{intencion}'"
    
    def agregarPrioridad(self, tarea):
        self.organizacion.hoy["prioridades"].append({"tarea": tarea, "completada": False})
        self.guardarOrganizacion()
        self.ganarXP(3, "Prioridad")
        return f"✅ Agregada, {self.usuario.nombre}: '{tarea}'"
    
    def completarTarea(self, tarea):
        for p in self.organizacion.hoy["prioridades"]:
            if tarea.lower() in p["tarea"].lower() and not p["completada"]:
                p["completada"] = True
                self.organizacion.hoy["completadas"].append(p["tarea"])
                self.guardarOrganizacion()
                self.ganarXP(10, "Tarea completada")
                return f"🎉 ¡Felicidades, {self.usuario.nombre}! Completaste '{p['tarea']}'. ¡Qué orgullo!"
        return None
    
    def obtenerResumenDia(self):
        hoy = self.organizacion.hoy
        resumen = f"📅 **Resumen de tu día, {self.usuario.nombre}:**\n\n"
        if hoy.get("intencion"):
            resumen += f"🎯 Intención: '{hoy['intencion']}'\n"
        if hoy.get("completadas"):
            resumen += f"✅ Completaste: {len(hoy['completadas'])} {'tarea' if len(hoy['completadas']) == 1 else 'tareas'}\n"
        if hoy.get("prioridades"):
            pendientes = [p for p in hoy["prioridades"] if not p.get("completada", False)]
            if pendientes:
                resumen += f"⏳ Pendientes: {len(pendientes)}\n"
        resumen += f"\n🎯 Nivel {self.memoria.evolucion.nivelActual} | ✨ {self.memoria.evolucion.xpTotal} XP"
        resumen += f"\n\n💭 Mañana es una nueva oportunidad para seguir creciendo, {self.usuario.nombre}."
        return resumen
    
    async def registrarFeedback(self, conversacionId, tipo):
        for c in self.memoria.conversaciones:
            if c.get("id") == conversacionId:
                await self.aprender(conversacionId, c.get("pregunta", ""), c.get("respuesta", ""), c.get("emocion", "neutral"), tipo)
                return {"success": True}
        return {"success": False}
    
    def obtenerEstado(self):
        return {
            "version": self.version,
            "nivel": self.memoria.evolucion.nivelActual,
            "xp": self.memoria.evolucion.xpTotal,
            "gemini": {"disponible": self.gemini.disponible, "modelo": self.gemini.model},
            "conversaciones": len(self.memoria.conversaciones),
            "usuarioNombre": self.usuario.nombre,
            "preguntasRealizadas": len(self.memoria.preguntasRealizadas),
            "perfilCargado": bool(self.memoria.perfilPsicologico.personalidad),
            "aprendizaje": {
                "palabras": len(self.aprendizaje.vocabulario["palabras"]),
                "lenguajes": len(self.aprendizaje.programacion),
                "aciertos": self.aprendizaje.memoria["aciertos"],
                "errores": self.aprendizaje.memoria["errores"]
            }
        }

# ==================== INSTANCIA GLOBAL ====================

repromptAI = RepromptIntelligence()

# ==================== EXPORTAR A JAVASCRIPT ====================

# Funciones disponibles para JavaScript
async def procesarPregunta(texto):
    resultado = await repromptAI.preguntar(texto)
    return resultado

def obtenerEstadoIA():
    return repromptAI.obtenerEstado()

async def registrarFeedbackIA(conversacionId, tipo):
    return await repromptAI.registrarFeedback(conversacionId, tipo)

def establecerIntencion(intencion):
    return repromptAI.establecerIntencion(intencion)

def agregarPrioridad(tarea):
    return repromptAI.agregarPrioridad(tarea)

def completarTarea(tarea):
    return repromptAI.completarTarea(tarea)

def obtenerResumenDia():
    return repromptAI.obtenerResumenDia()

def autoEvaluarIA():
    return repromptAI.aprendizaje.autoEvaluar()

def reproducirMusica(categoria, busqueda=None):
    return repromptAI.reproducirMusica(categoria, busqueda)

def reproducirAudiolibro(titulo, autor=None):
    return repromptAI.reproducirAudiolibro(titulo, autor)

def abrirAppMusica():
    return repromptAI.abrirAppMusica()

# Exponer al objeto global de JavaScript
js.repromptAI = repromptAI
js.procesarPregunta = procesarPregunta
js.obtenerEstadoIA = obtenerEstadoIA
js.registrarFeedbackIA = registrarFeedbackIA
js.establecerIntencion = establecerIntencion
js.agregarPrioridad = agregarPrioridad
js.completarTarea = completarTarea
js.obtenerResumenDia = obtenerResumenDia
js.autoEvaluarIA = autoEvaluarIA
js.reproducirMusica = reproducirMusica
js.reproducirAudiolibro = reproducirAudiolibro
js.abrirAppMusica = abrirAppMusica

print("🧠 REPROMPT Intelligence v36.0.0 - INTELIGENCIA TOTAL - 18 SISTEMAS")
print("✨ Con backoff exponencial anti-429")
print("🎯 XP: 84 | Nivel 1 - Aprendiz")
print("📡 Acceso a 18 sistemas de Reprompt OS")
print("💬 Contexto de conversación ACTIVADO")
print("⚡ Sistema de acciones activado")
print("👤 Reconocimiento de nombre activado")
print("📋 Preguntas proactivas para conocer al usuario")
print("📊 Perfil psicológico desde cuestionarios")
print("💻 Sistema de programación y auto-aprendizaje ACTIVADO")
print("🎵 Control de música COMPLETO - Reconoce TODAS las variantes de comandos")
