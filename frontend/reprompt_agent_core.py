# ============================================================
# REPROMPT AGENT CORE - VERSIÓN COMPLETA
# ARQUITECTURA HÍBRIDA: SISTEMA EXISTENTE + AGENTE INTELIGENTE
# TODAS LAS FUNCIONES EXISTENTES PRESERVADAS
# ============================================================

\"\"\"
REPROMPT AGENT CORE - VERSIÓN 1.0.0
EVOLUCIÓN DE REPROMPT AI A AGENTE INTELIGENTE TIPO JARVIS

ARQUITECTURA:
- AgentRouter: Decide entre sistema existente y agente
- AgentCore: Núcleo de razonamiento y planificación
- ToolRegistry: Registro y descubrimiento de herramientas
- PermissionManager: Control de permisos y seguridad
- Planner: Creación de planes multipaso
- MemoryManager: Gestión de memoria contextual
- ContextBuilder: Construcción dinámica de contexto
- AgentLogger: Logs y trazabilidad

TODAS LAS FUNCIONES EXISTENTES DE REPROMPT SE MANTIENEN
\"\"\"

import json
import re
import time
import random
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Set, Callable, Union
from dataclasses import dataclass, field, asdict
from enum import Enum
import js

# ==================== IMPORTAR REPROMPT EXISTENTE ====================
# Esta sección carga TODO el código existente de REPROMPT
# El archivo reprompt-intelligence.py ya está cargado con todas sus funciones

# ==================== CONFIGURACIÓN DEL AGENTE ====================

@dataclass
class AgentConfig:
    \"\"\"Configuración completa del agente\"\"\"
    max_iterations: int = 10
    timeout: int = 30
    enable_llm_reasoning: bool = True
    enable_tool_discovery: bool = True
    enable_auto_retry: bool = True
    require_confirmation_for_high_risk: bool = True
    log_level: str = "info"
    version: str = "1.0.0"
    agent_name: str = "REPROMPT Agent"
    max_plan_steps: int = 8
    enable_parallel_execution: bool = False
    enable_memory_compression: bool = True
    max_context_tokens: int = 4000


# ==================== ENUMS Y MODELOS ====================

class RiskLevel(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class PermissionStatus(Enum):
    ALLOWED = "allowed"
    DENIED = "denied"
    NEEDS_CONFIRMATION = "needs_confirmation"
    NEEDS_AUTH = "needs_auth"


class PlanStatus(Enum):
    CREATED = "created"
    EXECUTING = "executing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    NEEDS_INPUT = "needs_input"


@dataclass
class ToolDefinition:
    \"\"\"Definición completa de una herramienta\"\"\"
    name: str
    description: str
    category: str
    parameters: Dict[str, Any]
    risk_level: str = "low"
    requires_confirmation: bool = False
    execute: Optional[Callable] = None
    timeout: int = 30
    retries: int = 2
    dependencies: List[str] = field(default_factory=list)
    examples: List[str] = field(default_factory=list)
    tags: List[str] = field(default_factory=list)


@dataclass
class PlanStep:
    \"\"\"Paso individual de un plan\"\"\"
    action: str
    tool: str
    parameters: Dict[str, Any]
    dependencies: List[str] = field(default_factory=list)
    status: str = "pending"
    result: Any = None
    error: Optional[str] = None
    executed_at: Optional[float] = None
    execution_time: float = 0


@dataclass
class AgentPlan:
    \"\"\"Plan completo de ejecución\"\"\"
    goal: str
    steps: List[PlanStep]
    requires_confirmation: bool = False
    estimated_duration: int = 0
    status: str = "created"
    created_at: float = field(default_factory=time.time)
    completed_at: Optional[float] = None
    context: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ExecutionResult:
    \"\"\"Resultado de ejecución de una herramienta\"\"\"
    success: bool
    data: Any
    error: Optional[str] = None
    execution_time: float = 0
    tool_name: str = ""
    retries: int = 0
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class AgentContext:
    \"\"\"Contexto completo del agente\"\"\"
    message: str
    timestamp: float
    user_name: str
    user_profile: Dict
    recent_history: List[Dict]
    available_tools: List[Dict]
    current_tasks: List[Dict]
    user_goals: List[Dict]
    user_habits: List[Dict]
    relevant_memory: List[Dict]
    conversation_id: Optional[str] = None
    session_id: Optional[str] = None
    current_plan: Optional[AgentPlan] = None
    previous_results: List[ExecutionResult] = field(default_factory=list)
    emotions: Dict[str, Any] = field(default_factory=dict)


# ==================== PERMISSION MANAGER ====================

class PermissionManager:
    \"\"\"Gestor completo de permisos y seguridad\"\"\"
    
    def __init__(self):
        self._permissions = {
            RiskLevel.LOW.value: {
                "allowed": True, 
                "requires_confirmation": False,
                "requires_auth": False
            },
            RiskLevel.MEDIUM.value: {
                "allowed": True, 
                "requires_confirmation": True,
                "requires_auth": False
            },
            RiskLevel.HIGH.value: {
                "allowed": False, 
                "requires_confirmation": True,
                "requires_auth": True
            },
            RiskLevel.CRITICAL.value: {
                "allowed": False, 
                "requires_confirmation": True,
                "requires_auth": True
            }
        }
        
        self._risk_mapping = {
            # BAJO RIESGO - Lectura de información
            "consultar_metas": RiskLevel.LOW.value,
            "consultar_habitos": RiskLevel.LOW.value,
            "consultar_progreso": RiskLevel.LOW.value,
            "consultar_ejercicios": RiskLevel.LOW.value,
            "consultar_sueno": RiskLevel.LOW.value,
            "consultar_biblioteca": RiskLevel.LOW.value,
            "consultar_perfil": RiskLevel.LOW.value,
            "consultar_logros": RiskLevel.LOW.value,
            "consultar_comunidad": RiskLevel.LOW.value,
            "consultar_cuestionarios": RiskLevel.LOW.value,
            "consultar_mapas": RiskLevel.LOW.value,
            "consultar_plugins": RiskLevel.LOW.value,
            "obtener_resumen": RiskLevel.LOW.value,
            "obtener_estado": RiskLevel.LOW.value,
            "reproducir_musica": RiskLevel.LOW.value,
            "obtener_pregunta": RiskLevel.LOW.value,
            
            # RIESGO MEDIO - Creación y modificación
            "crear_meta": RiskLevel.MEDIUM.value,
            "actualizar_meta": RiskLevel.MEDIUM.value,
            "crear_habito": RiskLevel.MEDIUM.value,
            "completar_habito": RiskLevel.MEDIUM.value,
            "registrar_ejercicio": RiskLevel.MEDIUM.value,
            "registrar_sueno": RiskLevel.MEDIUM.value,
            "registrar_emocion": RiskLevel.MEDIUM.value,
            "agregar_libro": RiskLevel.MEDIUM.value,
            "actualizar_perfil": RiskLevel.MEDIUM.value,
            "establecer_intencion": RiskLevel.MEDIUM.value,
            "agregar_prioridad": RiskLevel.MEDIUM.value,
            "completar_tarea": RiskLevel.MEDIUM.value,
            "aprender_palabra": RiskLevel.MEDIUM.value,
            "aprender_codigo": RiskLevel.MEDIUM.value,
            
            # RIESGO ALTO - Eliminación y acciones críticas
            "eliminar_meta": RiskLevel.HIGH.value,
            "eliminar_habito": RiskLevel.HIGH.value,
            "eliminar_tarea": RiskLevel.HIGH.value,
            "eliminar_libro": RiskLevel.HIGH.value,
            "ejecutar_comando": RiskLevel.HIGH.value,
            "modificar_sistema": RiskLevel.HIGH.value,
            "instalar_plugin": RiskLevel.HIGH.value,
            "desinstalar_plugin": RiskLevel.HIGH.value,
            
            # RIESGO CRÍTICO
            "eliminar_datos": RiskLevel.CRITICAL.value,
            "ejecutar_script": RiskLevel.CRITICAL.value,
            "modificar_permisos": RiskLevel.CRITICAL.value
        }
        
        self._confirmed_actions = {}
        self._auth_tokens = {}
    
    def get_risk_level(self, tool_name: str) -> str:
        \"\"\"Obtiene el nivel de riesgo de una herramienta\"\"\"
        return self._risk_mapping.get(tool_name, RiskLevel.LOW.value)
    
    def check_permission(self, tool_name: str, params: Dict = None) -> Dict:
        \"\"\"Verifica permisos para una acción\"\"\"
        risk_level = self.get_risk_level(tool_name)
        permission = self._permissions.get(risk_level, {
            "allowed": False,
            "requires_confirmation": True,
            "requires_auth": True
        })
        
        # Verificar si requiere autenticación especial
        requires_auth = risk_level in [RiskLevel.HIGH.value, RiskLevel.CRITICAL.value]
        
        return {
            "allowed": permission["allowed"],
            "requires_confirmation": permission["requires_confirmation"],
            "requires_auth": requires_auth,
            "risk_level": risk_level,
            "reason": f"Action requires {risk_level} permission level"
        }
    
    async def request_confirmation(self, tool_name: str, action_description: str, params: Dict = None) -> bool:
        \"\"\"Solicita confirmación al usuario\"\"\"
        try:
            message = f"⚠️ **CONFIRMACIÓN REQUERIDA**\n\n"
            message += f"🔧 Herramienta: {tool_name}\n"
            message += f"📝 Descripción: {action_description}\n"
            
            if params:
                message += f"📋 Parámetros:\n"
                for key, value in params.items():
                    message += f"   • {key}: {value}\n"
            
            message += f"\n⚠️ Nivel de riesgo: {self.get_risk_level(tool_name).upper()}\n"
            message += f"\n¿Deseas continuar con esta acción?"
            
            # Mostrar en UI
            if hasattr(js, "confirm") and callable(js.confirm):
                result = js.confirm(message)
                if result:
                    self._confirmed_actions[tool_name] = time.time()
                return bool(result)
            
            # Fallback: registro en consola
            print(f"⚠️ [CONFIRMACIÓN REQUERIDA] {message}")
            return True
            
        except Exception as e:
            print(f"Error en confirmación: {e}")
            return False
    
    def is_confirmed(self, tool_name: str, timeout: int = 300) -> bool:
        \"\"\"Verifica si una acción fue confirmada recientemente\"\"\"
        if tool_name not in self._confirmed_actions:
            return False
        if time.time() - self._confirmed_actions[tool_name] > timeout:
            del self._confirmed_actions[tool_name]
            return False
        return True
    
    def revoke_confirmation(self, tool_name: str):
        \"\"\"Revoca la confirmación de una acción\"\"\"
        if tool_name in self._confirmed_actions:
            del self._confirmed_actions[tool_name]


# ==================== TOOL REGISTRY ====================

class ToolRegistry:
    \"\"\"Registro completo de herramientas con descubrimiento dinámico\"\"\"
    
    def __init__(self):
        self._tools: Dict[str, ToolDefinition] = {}
        self._categories: Dict[str, List[str]] = {}
        self._tool_usage: Dict[str, int] = {}
        self._tool_success: Dict[str, int] = {}
        self._tool_failures: Dict[str, int] = {}
        self._initialized = False
    
    def register(self, tool: ToolDefinition):
        \"\"\"Registra una nueva herramienta\"\"\"
        self._tools[tool.name] = tool
        
        if tool.category not in self._categories:
            self._categories[tool.category] = []
        if tool.name not in self._categories[tool.category]:
            self._categories[tool.category].append(tool.name)
        
        if tool.name not in self._tool_usage:
            self._tool_usage[tool.name] = 0
        if tool.name not in self._tool_success:
            self._tool_success[tool.name] = 0
        if tool.name not in self._tool_failures:
            self._tool_failures[tool.name] = 0
        
        print(f"🔧 Herramienta registrada: {tool.name} ({tool.category})")
        return tool
    
    def register_from_function(self, name: str, description: str, category: str, 
                               execute: Callable, parameters: Dict = None, 
                               risk_level: str = "low", requires_confirmation: bool = False):
        \"\"\"Registra una herramienta desde una función existente\"\"\"
        parameters = parameters or {}
        tool = ToolDefinition(
            name=name,
            description=description,
            category=category,
            parameters=parameters,
            risk_level=risk_level,
            requires_confirmation=requires_confirmation,
            execute=execute
        )
        return self.register(tool)
    
    def get_tool(self, name: str) -> Optional[ToolDefinition]:
        \"\"\"Obtiene una herramienta por nombre\"\"\"
        return self._tools.get(name)
    
    def get_all_tools(self) -> List[ToolDefinition]:
        \"\"\"Obtiene todas las herramientas registradas\"\"\"
        return list(self._tools.values())
    
    def get_tools_by_category(self, category: str) -> List[ToolDefinition]:
        \"\"\"Obtiene herramientas por categoría\"\"\"
        tool_names = self._categories.get(category, [])
        return [self._tools[name] for name in tool_names if name in self._tools]
    
    def get_tools_by_tag(self, tag: str) -> List[ToolDefinition]:
        \"\"\"Obtiene herramientas por tag\"\"\"
        return [t for t in self._tools.values() if tag in t.tags]
    
    def discover_tools(self, query: str, max_results: int = 5) -> List[ToolDefinition]:
        \"\"\"Descubre herramientas por búsqueda semántica\"\"\"
        query_lower = query.lower()
        scored = []
        
        for tool in self._tools.values():
            score = 0
            search_text = f"{tool.name} {tool.description} {tool.category} {' '.join(tool.tags)}".lower()
            
            # Coincidencia exacta en nombre
            if query_lower == tool.name.lower():
                score += 100
            
            # Palabras en descripción
            query_words = query_lower.split()
            for word in query_words:
                if len(word) > 2:
                    if word in search_text:
                        score += 10
                    if word in tool.name.lower():
                        score += 20
                    if word in tool.category.lower():
                        score += 15
            
            # Coincidencia en ejemplos
            for example in tool.examples:
                if query_lower in example.lower():
                    score += 25
            
            # Popularidad (más usada = más relevante)
            score += self._tool_usage.get(tool.name, 0) * 0.5
            
            if score > 0:
                scored.append((tool, score))
        
        scored.sort(key=lambda x: x[1], reverse=True)
        return [tool for tool, _ in scored[:max_results]]
    
    def get_tools_summary(self, max_per_category: int = 3) -> str:
        \"\"\"Obtiene un resumen de todas las herramientas\"\"\"
        summary = "📋 **Herramientas disponibles:**\n\n"
        
        for category, tool_names in self._categories.items():
            summary += f"**{category.upper()}**\n"
            count = 0
            for name in tool_names:
                if count >= max_per_category:
                    break
                tool = self._tools.get(name)
                if tool:
                    usage = self._tool_usage.get(name, 0)
                    success_rate = (self._tool_success.get(name, 0) / max(1, usage)) * 100
                    summary += f"  • {name}: {tool.description}"
                    if usage > 0:
                        summary += f" (usado {usage} veces, {success_rate:.0f}% éxito)"
                    summary += "\n"
                    count += 1
            if len(tool_names) > max_per_category:
                summary += f"  ... y {len(tool_names) - max_per_category} más\n"
            summary += "\n"
        
        return summary
    
    def log_usage(self, tool_name: str, success: bool):
        \"\"\"Registra el uso de una herramienta\"\"\"
        if tool_name in self._tool_usage:
            self._tool_usage[tool_name] += 1
            if success:
                self._tool_success[tool_name] = self._tool_success.get(tool_name, 0) + 1
            else:
                self._tool_failures[tool_name] = self._tool_failures.get(tool_name, 0) + 1
    
    def get_tool_stats(self, tool_name: str) -> Dict:
        \"\"\"Obtiene estadísticas de una herramienta\"\"\"
        usage = self._tool_usage.get(tool_name, 0)
        success = self._tool_success.get(tool_name, 0)
        failures = self._tool_failures.get(tool_name, 0)
        return {
            "usage": usage,
            "success": success,
            "failures": failures,
            "success_rate": (success / max(1, usage)) * 100
        }


# ==================== CONTEXT BUILDER ====================

class ContextBuilder:
    \"\"\"Construye contexto dinámico para el agente\"\"\"
    
    def __init__(self, reprompt_instance):
        self.reprompt = reprompt_instance
        self.max_history = 10
        self.max_memory_items = 20
        self.compression_threshold = 1000
    
    async def build(self, message: str, additional_context: Dict = None) -> AgentContext:
        \"\"\"Construye el contexto completo\"\"\"
        additional_context = additional_context or {}
        
        # Obtener información del usuario
        user_name = self.reprompt.usuario.nombre
        user_profile = {
            "nombre": user_name,
            "nivel": self.reprompt.memoria.evolucion.nivelActual,
            "xp": self.reprompt.memoria.evolucion.xpTotal,
            "arquetipo": self.reprompt.usuario.arquetipo,
            "personalidad": self.reprompt.memoria.perfilPsicologico.personalidad,
            "fortalezas": self.reprompt.memoria.perfilPsicologico.fortalezas,
            "proposito": self.reprompt.memoria.perfilPsicologico.proposito,
            "hobbies": self.reprompt.memoria.informacionUsuario.hobbies,
            "motivaciones": self.reprompt.memoria.informacionUsuario.motivaciones
        }
        
        # Obtener historial reciente
        recent_history = self.reprompt.memoria.conversaciones[:self.max_history]
        
        # Obtener memoria relevante
        relevant_memory = self._get_relevant_memory(message)
        
        # Obtener tareas actuales
        current_tasks = self.reprompt.organizacion.hoy.get("prioridades", [])
        
        # Obtener metas y hábitos
        user_goals = self.reprompt.datos.metas.get("lista", [])
        user_habits = self.reprompt.datos.habitos.get("lista", [])
        
        # Obtener herramientas disponibles
        available_tools = [{
            "name": t.name,
            "description": t.description,
            "category": t.category,
            "risk_level": t.risk_level,
            "parameters": t.parameters
        } for t in self.reprompt.tool_registry.get_all_tools()] if hasattr(self.reprompt, "tool_registry") else []
        
        return AgentContext(
            message=message,
            timestamp=time.time(),
            user_name=user_name,
            user_profile=user_profile,
            recent_history=recent_history,
            available_tools=available_tools,
            current_tasks=current_tasks,
            user_goals=user_goals,
            user_habits=user_habits,
            relevant_memory=relevant_memory,
            **additional_context
        )
    
    def _get_relevant_memory(self, message: str) -> List[Dict]:
        \"\"\"Obtiene memoria relevante para el mensaje\"\"\"
        message_lower = message.lower()
        relevant = []
        
        for conv in self.reprompt.memoria.conversaciones[:self.max_memory_items]:
            pregunta = conv.get("pregunta", "").lower()
            if any(word in pregunta for word in message_lower.split()[:5]):
                relevant.append(conv)
        
        # Si no hay memoria relevante, tomar las más recientes
        if not relevant:
            relevant = self.reprompt.memoria.conversaciones[:5]
        
        return relevant


# ==================== AGENT LOGGER ====================

class AgentLogger:
    \"\"\"Sistema de logging y trazabilidad del agente\"\"\"
    
    class LogLevel(Enum):
        DEBUG = "debug"
        INFO = "info"
        WARNING = "warning"
        ERROR = "error"
        TRACE = "trace"
    
    def __init__(self, level: str = "info"):
        self.level = self.LogLevel(level)
        self.logs = []
        self.max_logs = 1000
        self.trace_enabled = False
    
    def log(self, level: str, message: str, data: Dict = None):
        \"\"\"Registra un log\"\"\"
        try:
            log_level = self.LogLevel(level)
            if self._should_log(log_level):
                entry = {
                    "timestamp": time.time(),
                    "level": level,
                    "message": message,
                    "data": data or {},
                    "id": len(self.logs)
                }
                self.logs.append(entry)
                if len(self.logs) > self.max_logs:
                    self.logs = self.logs[-self.max_logs:]
                
                # Mostrar en consola
                if level in ["error", "warning"]:
                    print(f"⚠️ [{level.upper()}] {message}")
                elif level == "debug" and self.level == self.LogLevel.DEBUG:
                    print(f"🔍 [{level.upper()}] {message}")
                else:
                    print(f"📝 [{level.upper()}] {message}")
        except Exception as e:
            pass
    
    def trace(self, message: str, data: Dict = None):
        \"\"\"Log de trazabilidad detallada\"\"\"
        if self.trace_enabled:
            self.log("trace", message, data)
    
    def debug(self, message: str, data: Dict = None):
        self.log("debug", message, data)
    
    def info(self, message: str, data: Dict = None):
        self.log("info", message, data)
    
    def warning(self, message: str, data: Dict = None):
        self.log("warning", message, data)
    
    def error(self, message: str, data: Dict = None):
        self.log("error", message, data)
    
    def _should_log(self, level: LogLevel) -> bool:
        levels = [self.LogLevel.DEBUG, self.LogLevel.INFO, self.LogLevel.WARNING, self.LogLevel.ERROR, self.LogLevel.TRACE]
        return levels.index(level) >= levels.index(self.level)
    
    def get_logs(self, level: str = None, limit: int = 50) -> List[Dict]:
        \"\"\"Obtiene logs filtrados\"\"\"
        if level:
            return [l for l in self.logs[-limit:] if l["level"] == level]
        return self.logs[-limit:]
    
    def get_trace(self) -> List[Dict]:
        \"\"\"Obtiene logs de trazabilidad\"\"\"
        return [l for l in self.logs if l["level"] == "trace"]


# ==================== PLANNER ====================

class Planner:
    \"\"\"Crea y gestiona planes multipaso para el agente\"\"\"
    
    def __init__(self, tool_registry: ToolRegistry, max_steps: int = 8):
        self.tool_registry = tool_registry
        self.max_steps = max_steps
        self.plans = {}
    
    async def create_plan(self, goal: str, context: AgentContext) -> AgentPlan:
        \"\"\"Crea un plan para alcanzar un objetivo\"\"\"
        steps = []
        
        # Analizar el objetivo
        goal_type = self._classify_goal(goal)
        
        # Generar pasos según el tipo de objetivo
        if goal_type == "organization":
            steps = self._generate_organization_plan(context)
        elif goal_type == "review":
            steps = self._generate_review_plan(context)
        elif goal_type == "learning":
            steps = self._generate_learning_plan(context)
        elif goal_type == "creation":
            steps = self._generate_creation_plan(context)
        elif goal_type == "problem_solving":
            steps = self._generate_problem_solving_plan(context)
        elif goal_type == "information":
            steps = self._generate_information_plan(context)
        else:
            steps = self._generate_generic_plan(goal, context)
        
        # Limitar pasos
        if len(steps) > self.max_steps:
            steps = steps[:self.max_steps]
        
        # Crear plan
        plan = AgentPlan(
            goal=goal,
            steps=steps,
            requires_confirmation=self._check_confirmation_needed(steps),
            estimated_duration=len(steps) * 5
        )
        
        self.plans[plan.goal] = plan
        return plan
    
    def _classify_goal(self, goal: str) -> str:
        \"\"\"Clasifica el objetivo\"\"\"
        goal_lower = goal.lower()
        
        classifications = {
            "organization": ["organizar", "ordenar", "preparar", "configurar", "estructurar"],
            "review": ["revisar", "analizar", "examinar", "verificar", "comprobar"],
            "learning": ["aprender", "estudiar", "entender", "comprender", "practicar"],
            "creation": ["crear", "generar", "hacer", "construir", "desarrollar"],
            "problem_solving": ["solucionar", "arreglar", "reparar", "corregir", "resolver"],
            "information": ["buscar", "encontrar", "localizar", "obtener", "consultar"]
        }
        
        for key, words in classifications.items():
            if any(w in goal_lower for w in words):
                return key
        
        return "generic"
    
    def _generate_organization_plan(self, context: AgentContext) -> List[PlanStep]:
        \"\"\"Genera plan de organización\"\"\"
        return [
            PlanStep("consultar_progreso", "consultar_progreso", {}),
            PlanStep("listar_metas", "consultar_metas", {}),
            PlanStep("listar_habitos", "consultar_habitos", {}),
            PlanStep("organizar_prioridades", "completar_tarea", {"tarea": "Organizar prioridades del día"}),
            PlanStep("recomendar_organizacion", "recomendacion_personalizada", {})
        ]
    
    def _generate_review_plan(self, context: AgentContext) -> List[PlanStep]:
        \"\"\"Genera plan de revisión\"\"\"
        return [
            PlanStep("obtener_progreso", "consultar_progreso", {}),
            PlanStep("revisar_metas", "consultar_metas", {}),
            PlanStep("revisar_habitos", "consultar_habitos", {}),
            PlanStep("analizar_rendimiento", "consultar_ejercicios", {}),
            PlanStep("generar_reporte", "obtener_resumen", {})
        ]
    
    def _generate_learning_plan(self, context: AgentContext) -> List[PlanStep]:
        \"\"\"Genera plan de aprendizaje\"\"\"
        return [
            PlanStep("consultar_biblioteca", "consultar_biblioteca", {}),
            PlanStep("buscar_recursos", "consultar_cuestionarios", {}),
            PlanStep("crear_plan_estudio", "crear_meta", {"nombre": "Plan de estudio"}),
            PlanStep("programar_sesiones", "agregar_prioridad", {"tarea": "Sesión de estudio"})
        ]
    
    def _generate_creation_plan(self, context: AgentContext) -> List[PlanStep]:
        \"\"\"Genera plan de creación\"\"\"
        return [
            PlanStep("definir_objetivo", "agregar_prioridad", {"tarea": "Definir objetivo de creación"}),
            PlanStep("crear_estructura", "crear_meta", {"nombre": "Estructura del proyecto"}),
            PlanStep("validar_creacion", "consultar_progreso", {})
        ]
    
    def _generate_problem_solving_plan(self, context: AgentContext) -> List[PlanStep]:
        \"\"\"Genera plan de resolución de problemas\"\"\"
        return [
            PlanStep("identificar_problema", "analizar_profundamente", {}),
            PlanStep("buscar_soluciones", "consultar_biblioteca", {}),
            PlanStep("proponer_solucion", "recomendacion_personalizada", {}),
            PlanStep("ejecutar_solucion", "completar_tarea", {"tarea": "Implementar solución"})
        ]
    
    def _generate_information_plan(self, context: AgentContext) -> List[PlanStep]:
        \"\"\"Genera plan de búsqueda de información\"\"\"
        # Buscar herramientas que puedan proporcionar información
        tools = self.tool_registry.discover_tools(context.message, 5)
        steps = []
        for tool in tools:
            if "consultar" in tool.name or "obtener" in tool.name:
                steps.append(PlanStep(tool.name, tool.name, {}))
        return steps if steps else [
            PlanStep("consultar_ayuda", "ayuda", {}),
            PlanStep("buscar_informacion", "consultar_biblioteca", {})
        ]
    
    def _generate_generic_plan(self, goal: str, context: AgentContext) -> List[PlanStep]:
        \"\"\"Genera plan genérico\"\"\"
        # Buscar herramientas relevantes
        tools = self.tool_registry.discover_tools(goal, 5)
        steps = []
        for tool in tools:
            steps.append(PlanStep(tool.name, tool.name, {}))
        return steps if steps else [
            PlanStep("analizar_consulta", "consultar_ayuda", {}),
            PlanStep("buscar_informacion", "consultar_biblioteca", {}),
            PlanStep("generar_respuesta", "obtener_resumen", {})
        ]
    
    def _check_confirmation_needed(self, steps: List[PlanStep]) -> bool:
        \"\"\"Verifica si algún paso requiere confirmación\"\"\"
        for step in steps:
            tool = self.tool_registry.get_tool(step.tool)
            if tool and tool.requires_confirmation:
                return True
        return False


# ==================== AGENT CORE ====================

class AgentCore:
    \"\"\"Núcleo del agente inteligente - Razona, planifica y ejecuta\"\"\"
    
    def __init__(self, reprompt_instance):
        self.reprompt = reprompt_instance
        self.config = AgentConfig()
        self.logger = AgentLogger(self.config.log_level)
        
        # Inicializar componentes
        self.tool_registry = ToolRegistry()
        self.permission_manager = PermissionManager()
        self.context_builder = ContextBuilder(reprompt_instance)
        self.planner = Planner(self.tool_registry, self.config.max_plan_steps)
        
        # Asignar tool registry al reprompt para acceso global
        self.reprompt.tool_registry = self.tool_registry
        
        # Estado del agente
        self.current_plan = None
        self.execution_history = []
        self.is_running = False
        
        # Registrar herramientas existentes
        self._register_reprompt_tools()
        
        self.logger.info("🧠 Agent Core inicializado correctamente")
        self.logger.info(f"🔧 {len(self.tool_registry.get_all_tools())} herramientas registradas")
    
    def _register_reprompt_tools(self):
        \"\"\"Registra todas las funciones de REPROMPT como herramientas\"\"\"
        
        # METAS
        self.tool_registry.register_from_function(
            name="consultar_metas",
            description="Obtiene la lista de metas del usuario con su progreso",
            category="metas",
            execute=lambda params: self._safe_run(self.reprompt.responderConsultaMetas)
        )
        
        self.tool_registry.register_from_function(
            name="crear_meta",
            description="Crea una nueva meta para el usuario",
            category="metas",
            parameters={"nombre": "string"},
            risk_level="medium",
            execute=lambda params: self._safe_run(self.reprompt.ejecutarAccion, f"crear meta {params.get('nombre', '')}")
        )
        
        self.tool_registry.register_from_function(
            name="actualizar_meta",
            description="Actualiza el progreso de una meta existente",
            category="metas",
            parameters={"nombre": "string", "progreso": "number"},
            risk_level="medium",
            execute=lambda params: self._safe_run(self.reprompt.ejecutarAccion, f"actualizar meta {params.get('nombre', '')} a {params.get('progreso', 0)}%")
        )
        
        # HÁBITOS
        self.tool_registry.register_from_function(
            name="consultar_habitos",
            description="Obtiene la lista de hábitos del usuario",
            category="habitos",
            execute=lambda params: self._safe_run(self.reprompt.responderConsultaHabitos)
        )
        
        self.tool_registry.register_from_function(
            name="crear_habito",
            description="Crea un nuevo hábito para el usuario",
            category="habitos",
            parameters={"nombre": "string"},
            risk_level="medium",
            execute=lambda params: self._safe_run(self.reprompt.ejecutarAccion, f"crear hábito de {params.get('nombre', '')}")
        )
        
        self.tool_registry.register_from_function(
            name="completar_habito",
            description="Marca un hábito como completado hoy",
            category="habitos",
            parameters={"nombre": "string"},
            risk_level="medium",
            execute=lambda params: self._safe_run(self.reprompt.ejecutarAccion, f"completé mi hábito de {params.get('nombre', '')}")
        )
        
        # EJERCICIOS
        self.tool_registry.register_from_function(
            name="consultar_ejercicios",
            description="Obtiene estadísticas de ejercicio del usuario",
            category="ejercicios",
            execute=lambda params: self._safe_run(self.reprompt.responderConsultaEjercicios)
        )
        
        self.tool_registry.register_from_function(
            name="registrar_ejercicio",
            description="Registra una sesión de ejercicio",
            category="ejercicios",
            parameters={"tipo": "string", "minutos": "number"},
            risk_level="medium",
            execute=lambda params: self._safe_run(self.reprompt.ejecutarAccion, f"hice {params.get('minutos', 30)} minutos de {params.get('tipo', 'ejercicio')}")
        )
        
        # SUEÑO
        self.tool_registry.register_from_function(
            name="consultar_sueno",
            description="Obtiene información del sueño del usuario",
            category="sueno",
            execute=lambda params: self._safe_run(self.reprompt.responderConsultaSueno)
        )
        
        self.tool_registry.register_from_function(
            name="registrar_sueno",
            description="Registra horas y calidad de sueño",
            category="sueno",
            parameters={"horas": "number", "calidad": "number"},
            risk_level="medium",
            execute=lambda params: self._safe_run(self.reprompt.ejecutarAccion, f"dormí {params.get('horas', 7)} horas calidad {params.get('calidad', 7)}")
        )
        
        # MÚSICA
        self.tool_registry.register_from_function(
            name="reproducir_musica",
            description="Reproduce música según categoría (concentracion, dormir, meditar, motivacion)",
            category="musica",
            parameters={"categoria": "string", "busqueda": "string"},
            execute=lambda params: self.reprompt.reproducirMusica(params.get("categoria"), params.get("busqueda"))
        )
        
        # PROGRESO
        self.tool_registry.register_from_function(
            name="consultar_progreso",
            description="Obtiene el resumen completo de progreso del usuario",
            category="progreso",
            execute=lambda params: self._safe_run(self.reprompt.responderConsultaProgreso)
        )
        
        # PERFIL
        self.tool_registry.register_from_function(
            name="consultar_perfil",
            description="Obtiene la información del perfil del usuario",
            category="perfil",
            execute=lambda params: self._safe_run(self.reprompt.responderPerfil)
        )
        
        self.tool_registry.register_from_function(
            name="actualizar_perfil",
            description="Actualiza información del perfil del usuario",
            category="perfil",
            parameters={"nombre": "string", "edad": "number", "ocupacion": "string"},
            risk_level="medium",
            execute=lambda params: self._safe_run(self.reprompt.guardarInformacionUsuario)
        )
        
        # BIBLIOTECA
        self.tool_registry.register_from_function(
            name="consultar_biblioteca",
            description="Obtiene la lista de libros del usuario",
            category="biblioteca",
            execute=lambda params: self._safe_run(self.reprompt.responderConsultaBiblioteca)
        )
        
        # EMOCIONES
        self.tool_registry.register_from_function(
            name="registrar_emocion",
            description="Registra el estado emocional del usuario",
            category="bienestar",
            parameters={"emocion": "string"},
            risk_level="medium",
            execute=lambda params: self._safe_run(self.reprompt.ejecutarAccion, f"me siento {params.get('emocion', '')}")
        )
        
        # ORGANIZACIÓN
        self.tool_registry.register_from_function(
            name="establecer_intencion",
            description="Establece la intención del día",
            category="organizacion",
            parameters={"intencion": "string"},
            risk_level="medium",
            execute=lambda params: self.reprompt.establecerIntencion(params.get("intencion", ""))
        )
        
        self.tool_registry.register_from_function(
            name="agregar_prioridad",
            description="Agrega una prioridad para el día",
            category="organizacion",
            parameters={"tarea": "string"},
            risk_level="medium",
            execute=lambda params: self.reprompt.agregarPrioridad(params.get("tarea", ""))
        )
        
        self.tool_registry.register_from_function(
            name="completar_tarea",
            description="Marca una tarea como completada",
            category="organizacion",
            parameters={"tarea": "string"},
            risk_level="medium",
            execute=lambda params: self.reprompt.completarTarea(params.get("tarea", ""))
        )
        
        # AYUDA
        self.tool_registry.register_from_function(
            name="ayuda",
            description="Muestra la lista de comandos y capacidades disponibles",
            category="sistema",
            execute=lambda params: self._safe_run(self.reprompt.responderAyuda)
        )
        
        # CUESTIONARIOS
        self.tool_registry.register_from_function(
            name="consultar_cuestionarios",
            description="Obtiene información sobre cuestionarios completados",
            category="cuestionarios",
            execute=lambda params: self._safe_run(self.reprompt.responderConsultaCuestionarios)
        )
        
        # LOGROS
        self.tool_registry.register_from_function(
            name="consultar_logros",
            description="Obtiene los logros obtenidos por el usuario",
            category="logros",
            execute=lambda params: self._safe_run(self.reprompt.responderConsultaLogros)
        )
        
        # RESUMEN
        self.tool_registry.register_from_function(
            name="obtener_resumen",
            description="Obtiene un resumen completo del día",
            category="sistema",
            execute=lambda params: self.reprompt.obtenerResumenDia()
        )
        
        # ANÁLISIS PROFUNDO
        self.tool_registry.register_from_function(
            name="analizar_profundamente",
            description="Analiza un texto en profundidad extrayendo emociones y contexto",
            category="analisis",
            parameters={"texto": "string"},
            execute=lambda params: self.reprompt.analizarProfundamente(params.get("texto", ""))
        )
        
        # RECOMENDACIÓN
        self.tool_registry.register_from_function(
            name="recomendacion_personalizada",
            description="Genera una recomendación personalizada para el usuario",
            category="recomendaciones",
            execute=lambda params: self._safe_run(self._generate_recommendation)
        )
        
        # APRENDIZAJE
        self.tool_registry.register_from_function(
            name="aprender_palabra",
            description="Aprende una nueva palabra o concepto",
            category="aprendizaje",
            parameters={"palabra": "string", "contexto": "string"},
            risk_level="medium",
            execute=lambda params: self.reprompt.aprendizaje.aprenderPalabra(params.get("palabra", ""), params.get("contexto", ""))
        )
    
    async def _safe_run(self, func, *args, **kwargs):
        \"\"\"Ejecuta una función de forma segura\"\"\"
        try:
            if asyncio.iscoroutinefunction(func):
                result = await func(*args, **kwargs)
            else:
                result = func(*args, **kwargs)
            return result
        except Exception as e:
            self.logger.error(f"Error ejecutando {func.__name__}: {e}")
            return {"error": str(e)}
    
    async def _generate_recommendation(self, params=None):
        \"\"\"Genera una recomendación personalizada\"\"\"
        try:
            # Usar la función existente de REPROMPT
            return await self.reprompt.respuestaSabia({
                "original": "Dame una recomendación personalizada",
                "emocionPrincipal": "neutral"
            })
        except Exception as e:
            return {"texto": f"🌟 Sigue en tu camino de crecimiento. {e}"}
    
    # ==================== PROCESAMIENTO PRINCIPAL ====================
    
    async def process(self, message: str, context: Dict = None) -> Dict:
        \"\"\"Punto de entrada principal del agente\"\"\"
        self.logger.info(f"📩 Procesando: {message[:50]}...")
        self.is_running = True
        
        try:
            # 1. Construir contexto
            agent_context = await self.context_builder.build(message, context or {})
            self.logger.debug("Contexto construido", {"user": agent_context.user_name})
            
            # 2. Verificar si es una intención conocida primero
            intent = self.reprompt.detectarIntencion(message)
            
            # 3. Si es una intención conocida con alta confianza, usar sistema existente
            if intent.get("intencion") != "conversacion_general" and intent.get("confianza", 0) > 0.7:
                self.logger.info(f"🎯 Intención conocida: {intent['intencion']} - Usando sistema existente")
                result = await self.reprompt.preguntar(message)
                self.is_running = False
                return result
            
            # 4. Si es una pregunta simple, usar sistema existente
            if self._is_simple_question(message):
                self.logger.info("💭 Pregunta simple - Usando sistema existente")
                result = await self.reprompt.preguntar(message)
                self.is_running = False
                return result
            
            # 5. Usar el agente para razonar y actuar
            self.logger.info("🤖 Usando Agent Core para razonamiento")
            result = await self._reason_and_act(agent_context)
            
            self.is_running = False
            return result
            
        except Exception as e:
            self.logger.error(f"Error en procesamiento: {e}")
            self.is_running = False
            return {
                "texto": f"⚠️ Error procesando tu solicitud: {str(e)}",
                "emocion": "neutral",
                "tipoRespuesta": "error",
                "confianza": 0.5
            }
    
    def _is_simple_question(self, message: str) -> bool:
        \"\"\"Determina si es una pregunta simple\"\"\"
        msg = message.lower()
        question_words = ["qué", "quién", "quien", "cómo", "cuando", "dónde", "por qué", "para qué"]
        simple_indicators = ["es", "está", "son", "están", "existe", "tiene"]
        length = len(msg.split())
        
        return length < 10 and any(q in msg for q in question_words) and any(i in msg for i in simple_indicators)
    
    # ==================== RAZONAMIENTO Y ACCIÓN ====================
    
    async def _reason_and_act(self, context: AgentContext) -> Dict:
        \"\"\"Ciclo principal de razonamiento y acción del agente\"\"\"
        iteration = 0
        previous_results = []
        
        while iteration < self.config.max_iterations:
            iteration += 1
            self.logger.debug(f"🔄 Iteración {iteration}/{self.config.max_iterations}")
            
            # 1. Analizar y razonar
            analysis = await self._analyze(context)
            
            # 2. Si es una respuesta directa
            if analysis.get("is_direct_response"):
                return {
                    "texto": analysis.get("response", "No tengo una respuesta directa."),
                    "emocion": "neutral",
                    "tipoRespuesta": "agente_directo",
                    "confianza": 0.85,
                    "iteraciones": iteration
                }
            
            # 3. Crear o continuar plan
            if not context.current_plan:
                context.current_plan = await self.planner.create_plan(
                    analysis.get("goal", "completar_solicitud"),
                    context
                )
                self.logger.info(f"📋 Plan creado: {context.current_plan.goal} ({len(context.current_plan.steps)} pasos)")
            
            # 4. Ejecutar siguiente paso
            next_step = self._get_next_step(context.current_plan)
            if not next_step:
                # Plan completado
                return await self._finalize_plan(context.current_plan, context)
            
            # 5. Verificar permisos
            tool = self.tool_registry.get_tool(next_step.tool)
            if tool:
                permission = self.permission_manager.check_permission(tool.name)
                if permission["requires_confirmation"]:
                    confirmed = await self.permission_manager.request_confirmation(
                        tool.name,
                        next_step.action,
                        next_step.parameters
                    )
                    if not confirmed:
                        next_step.status = "cancelled"
                        return {
                            "texto": f"⏸️ Acción '{next_step.action}' cancelada por el usuario.",
                            "emocion": "neutral",
                            "tipoRespuesta": "cancelado",
                            "confianza": 0.9
                        }
            
            # 6. Ejecutar paso
            result = await self._execute_step(next_step, context)
            previous_results.append(result)
            context.previous_results = previous_results
            
            # 7. Evaluar resultado
            evaluation = await self._evaluate_result(result, context)
            
            if evaluation.get("goal_achieved"):
                return await self._finalize_plan(context.current_plan, context)
            
            if evaluation.get("needs_retry"):
                next_step.status = "pending"
                self.logger.info(f"🔄 Reintentando paso: {next_step.action}")
                continue
            
            # 8. Actualizar plan si es necesario
            if evaluation.get("needs_replan"):
                context.current_plan = await self.planner.create_plan(
                    evaluation.get("new_goal", context.current_plan.goal),
                    context
                )
                self.logger.info("📋 Plan re-planificado")
        
        # Límite de iteraciones alcanzado
        return {
            "texto": f"⏳ He trabajado en tu solicitud pero necesito más tiempo. ¿Qué parte quieres que termine?",
            "emocion": "neutral",
            "tipoRespuesta": "agente_incompleto",
            "confianza": 0.7,
            "iteraciones": iteration,
            "pasos_completados": len([r for r in previous_results if r.success])
        }
    
    async def _analyze(self, context: AgentContext) -> Dict:
        \"\"\"Analiza el mensaje y contexto\"\"\"
        analysis = {
            "goal": "completar_solicitud",
            "is_direct_response": False,
            "response": None,
            "requires_tools": True
        }
        
        # Intentar usar Gemini para análisis avanzado si está disponible
        if self.reprompt.gemini.disponible:
            try:
                prompt = f"""Analiza la siguiente solicitud del usuario y determina:
                1. El objetivo principal (en una palabra o frase corta)
                2. Si se puede responder directamente sin herramientas
                3. Una respuesta directa si es posible

                Usuario: {context.user_name}
                Mensaje: {context.message}

                Responde en formato JSON:
                {{"goal": "...", "is_direct_response": true/false, "response": "..."}}"""
                
                result = await self.reprompt.generarConGemini({
                    "original": prompt,
                    "emocionPrincipal": "neutral"
                })
                
                if result and result.get("texto"):
                    try:
                        import json
                        parsed = json.loads(result["texto"])
                        analysis.update(parsed)
                    except:
                        pass
            except Exception as e:
                self.logger.debug(f"Error en análisis Gemini: {e}")
        
        return analysis
    
    def _get_next_step(self, plan: AgentPlan) -> Optional[PlanStep]:
        \"\"\"Obtiene el siguiente paso a ejecutar\"\"\"
        for step in plan.steps:
            if step.status == "pending":
                # Verificar dependencias
                dependencies_met = True
                for dep in step.dependencies:
                    dep_step = next((s for s in plan.steps if s.action == dep), None)
                    if dep_step and dep_step.status != "completed":
                        dependencies_met = False
                        break
                if dependencies_met:
                    return step
        return None
    
    async def _execute_step(self, step: PlanStep, context: AgentContext) -> ExecutionResult:
        \"\"\"Ejecuta un paso del plan\"\"\"
        self.logger.info(f"⚡ Ejecutando: {step.action} (herramienta: {step.tool})")
        
        tool = self.tool_registry.get_tool(step.tool)
        if not tool:
            step.status = "failed"
            return ExecutionResult(
                success=False,
                data=None,
                error=f"Herramienta '{step.tool}' no encontrada",
                tool_name=step.tool
            )
        
        start_time = time.time()
        retries = 0
        last_error = None
        
        while retries <= tool.retries:
            try:
                # Ejecutar herramienta
                if asyncio.iscoroutinefunction(tool.execute):
                    result = await tool.execute(step.parameters)
                else:
                    result = tool.execute(step.parameters)
                
                execution_time = time.time() - start_time
                self.tool_registry.log_usage(tool.name, True)
                
                step.status = "completed"
                step.result = result
                step.executed_at = time.time()
                step.execution_time = execution_time
                
                self.logger.info(f"✅ Paso completado: {step.action} ({execution_time:.2f}s)")
                
                return ExecutionResult(
                    success=True,
                    data=result,
                    execution_time=execution_time,
                    tool_name=step.tool,
                    retries=retries
                )
                
            except Exception as e:
                last_error = str(e)
                retries += 1
                self.logger.warning(f"⚠️ Error en {step.action} (intento {retries}/{tool.retries}): {e}")
                if retries <= tool.retries:
                    await asyncio.sleep(1 * retries)  # Backoff simple
        
        step.status = "failed"
        step.error = last_error
        
        self.tool_registry.log_usage(tool.name, False)
        
        return ExecutionResult(
            success=False,
            data=None,
            error=last_error,
            tool_name=step.tool,
            retries=retries
        )
    
    async def _evaluate_result(self, result: ExecutionResult, context: AgentContext) -> Dict:
        \"\"\"Evalúa el resultado de un paso\"\"\"
        evaluation = {
            "goal_achieved": False,
            "needs_retry": False,
            "needs_replan": False,
            "new_goal": None
        }
        
        if result.success:
            # Verificar si el resultado indica que el objetivo está cumplido
            if isinstance(result.data, dict):
                if result.data.get("goal_achieved"):
                    evaluation["goal_achieved"] = True
                if result.data.get("tipoRespuesta") == "agente_completo":
                    evaluation["goal_achieved"] = True
        else:
            # Si falló, intentar recuperar
            evaluation["needs_retry"] = True
            
            # Si ya se intentó demasiado, re-planificar
            if result.retries >= 2:
                evaluation["needs_replan"] = True
                evaluation["new_goal"] = f"encontrar_alternativa_para_{context.current_plan.goal if context.current_plan else 'solicitud'}"
        
        return evaluation
    
    async def _finalize_plan(self, plan: AgentPlan, context: AgentContext) -> Dict:
        \"\"\"Finaliza un plan y genera respuesta\"\"\"
        plan.status = "completed"
        plan.completed_at = time.time()
        
        # Recopilar resultados
        results = []
        for step in plan.steps:
            if step.status == "completed" and step.result:
                results.append({
                    "accion": step.action,
                    "resultado": step.result
                })
        
        # Generar respuesta final
        if results:
            if len(results) == 1:
                resultado = results[0]["resultado"]
                if isinstance(resultado, dict) and "texto" in resultado:
                    return resultado
                return {
                    "texto": f"✅ Completado: {results[0]['accion']}",
                    "emocion": "positivo",
                    "tipoRespuesta": "agente_completo",
                    "confianza": 0.95,
                    "resultados": results
                }
            else:
                return {
                    "texto": f"✅ Completé {len(results)} acciones para tu solicitud.",
                    "emocion": "positivo",
                    "tipoRespuesta": "agente_completo",
                    "confianza": 0.95,
                    "resultados": results
                }
        
        return {
            "texto": "✅ He procesado tu solicitud.",
            "emocion": "positivo",
            "tipoRespuesta": "agente_completo",
            "confianza": 0.9
        }


# ==================== AGENT ROUTER ====================

class AgentRouter:
    \"\"\"Router que decide entre sistema existente y agente inteligente\"\"\"
    
    def __init__(self, reprompt_instance):
        self.reprompt = reprompt_instance
        self.agent_core = None
        self.logger = AgentLogger()
        self.initialized = False
    
    async def initialize(self):
        \"\"\"Inicializa el router y el agente\"\"\"
        if not self.initialized:
            self.agent_core = AgentCore(self.reprompt)
            self.initialized = True
            self.logger.info("✅ Agent Router inicializado")
        return self
    
    async def route(self, message: str) -> Dict:
        \"\"\"Enruta el mensaje al sistema apropiado\"\"\"
        self.logger.info(f"🚦 Enrutando: {message[:50]}...")
        
        # 1. Intentar detectar intención conocida
        intent = self.reprompt.detectarIntencion(message)
        
        # 2. Si la intención es conocida y tiene alta confianza
        if intent.get("intencion") != "conversacion_general" and intent.get("confianza", 0) > 0.7:
            self.logger.info(f"🎯 Ruta: Intención conocida → Sistema existente ({intent['intencion']})")
            return await self.reprompt.preguntar(message)
        
        # 3. Si es una pregunta simple
        if self._is_simple_question(message):
            self.logger.info("💭 Ruta: Pregunta simple → Sistema existente")
            return await self.reprompt.preguntar(message)
        
        # 4. Si es un saludo o agradecimiento
        if self._is_greeting(message):
            self.logger.info("👋 Ruta: Saludo → Sistema existente")
            return await self.reprompt.preguntar(message)
        
        # 5. Si contiene palabras clave de sistemas conocidos pero con contexto complejo
        if self._has_known_topic(message) and self._is_complex_request(message):
            self.logger.info("🧠 Ruta: Tópico conocido pero complejo → Agent Core")
            return await self.agent_core.process(message)
        
        # 6. Si la intención es desconocida
        self.logger.info("🤖 Ruta: Intención desconocida → Agent Core")
        return await self.agent_core.process(message)
    
    def _is_simple_question(self, message: str) -> bool:
        \"\"\"Detecta preguntas simples\"\"\"
        msg = message.lower()
        question_words = ["qué", "quién", "quien", "cómo", "cuando", "dónde", "por qué", "para qué"]
        simple_indicators = ["es", "está", "son", "están", "existe", "tiene"]
        length = len(msg.split())
        
        return length < 10 and any(q in msg for q in question_words) and any(i in msg for i in simple_indicators)
    
    def _is_greeting(self, message: str) -> bool:
        \"\"\"Detecta saludos\"\"\"
        msg = message.lower().strip()
        greetings = ["hola", "buenos días", "buenas tardes", "buenas noches", "hey", "qué tal", "saludos"]
        return any(msg == g or msg.startswith(g + " ") for g in greetings)
    
    def _has_known_topic(self, message: str) -> bool:
        \"\"\"Detecta si el mensaje contiene tópicos conocidos\"\"\"
        msg = message.lower()
        topics = ["meta", "hábito", "ejercicio", "sueño", "música", "libro", "progreso", "perfil", 
                  "tarea", "logro", "biblioteca", "comunidad", "crisis", "bienestar", "emocional"]
        return any(t in msg for t in topics)
    
    def _is_complex_request(self, message: str) -> bool:
        \"\"\"Detecta si es una solicitud compleja\"\"\"
        msg = message.lower()
        complex_indicators = ["preparar", "organizar", "configurar", "revisar", "analizar", 
                             "crear", "desarrollar", "implementar", "solucionar", "arreglar"]
        length = len(msg.split())
        
        return length > 10 and any(i in msg for i in complex_indicators)


# ==================== INTEGRACIÓN CON REPROMPT EXISTENTE ====================

class RepromptAgentIntegration:
    \"\"\"Integra el agente con el REPROMPT existente\"\"\"
    
    def __init__(self, reprompt_instance):
        self.reprompt = reprompt_instance
        self.router = None
        self.logger = AgentLogger()
        self.initialized = False
    
    async def initialize(self):
        \"\"\"Inicializa la integración\"\"\"
        if not self.initialized:
            self.router = AgentRouter(self.reprompt)
            await self.router.initialize()
            
            # Sobrescribir el método preguntar original con el enrutador
            original_preguntar = self.reprompt.preguntar
            
            async def preguntar_con_agente(texto):
                return await self.router.route(texto)
            
            self.reprompt.preguntar = preguntar_con_agente
            self.reprompt.original_preguntar = original_preguntar
            self.reprompt.agent_router = self.router
            self.reprompt.agent_core = self.router.agent_core
            
            self.initialized = True
            self.logger.info("✅ REPROMPT Agent Integration completada")
            self.logger.info(f"🔧 {len(self.router.agent_core.tool_registry.get_all_tools())} herramientas disponibles")
    
    def get_status(self) -> Dict:
        \"\"\"Obtiene el estado de la integración\"\"\"
        if not self.initialized:
            return {"status": "not_initialized"}
        
        return {
            "status": "running",
            "tools": len(self.router.agent_core.tool_registry.get_all_tools()),
            "iterations": self.router.agent_core.config.max_iterations,
            "agent_name": self.router.agent_core.config.agent_name,
            "logger_level": self.router.agent_core.logger.level.value
        }


# ==================== FUNCIONES DE EXPORTACIÓN ====================

# Inicializar integración
async def init_agent(reprompt_instance):
    \"\"\"Inicializa el agente con la instancia de REPROMPT\"\"\"
    integration = RepromptAgentIntegration(reprompt_instance)
    await integration.initialize()
    return integration

# Función de ejemplo para registrar herramientas nuevas
def register_custom_tool(reprompt_instance, name, description, category, execute, parameters=None, risk_level="low"):
    \"\"\"Registra una herramienta personalizada\"\"\"
    if hasattr(reprompt_instance, "tool_registry"):
        return reprompt_instance.tool_registry.register_from_function(
            name=name,
            description=description,
            category=category,
            execute=execute,
            parameters=parameters or {},
            risk_level=risk_level
        )
    return None

# Exponer funciones a JavaScript
js.init_agent = init_agent
js.register_custom_tool = register_custom_tool
js.AgentCore = AgentCore
js.AgentRouter = AgentRouter
js.ToolRegistry = ToolRegistry
js.PermissionManager = PermissionManager
js.Planner = Planner
js.AgentLogger = AgentLogger

print("🧠 REPROMPT AGENT CORE v1.0.0 - EVOLUCIÓN COMPLETA")
print("✨ Arquitectura híbrida: Sistema existente + Agente Inteligente")
print("🔧 Todas las funciones existentes preservadas")
print("🎯 Capacidades: Razonamiento, Planificación, Herramientas, Permisos")
