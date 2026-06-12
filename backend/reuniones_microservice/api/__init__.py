from .reunion_terapeutica_router import ReunionTerapeuticaRouter
from .reunion_inicial_router import ReunionInicialRouter
from .reunion_administracion_router import ReunionAdministracionRouter

routes_list = [
    [ReunionTerapeuticaRouter, "/reunion_terapeutica", ["ReunionTerapeutica"]],
    [ReunionInicialRouter, "/reunion_inicial", ["ReunionInicial"]],
    [ReunionAdministracionRouter, "/reunion_administracion", ["ReunionAdministracion"]],
]
