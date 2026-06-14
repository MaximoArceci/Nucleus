from .reunion_terapeutica_router import ReunionTerapeuticaRouter
from .reunion_inicial_router import ReunionInicialRouter
from .reunion_administracion_router import ReunionAdministracionRouter
from .reunion_router import ReunionRouter

routes_list = [
    [ReunionRouter, "/reunion", ["Reunion"]],
    [ReunionTerapeuticaRouter, "/reunion_terapeutica", ["ReunionTerapeutica"]],
    [ReunionInicialRouter, "/reunion_inicial", ["ReunionInicial"]],
    [ReunionAdministracionRouter, "/reunion_administracion", ["ReunionAdministracion"]],
]
