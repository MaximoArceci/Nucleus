from .paciente_router import PacienteRouter
from .terapeuta_router import TerapeutaRouter
from .candidato_router import CandidatoRouter
from .administrador_router import AdministradorRouter
from .voluntario_router import VoluntarioRouter
from .area_router import AreaRouter

routes_list = [
    [AreaRouter, "/area", ["Area"]],
    [VoluntarioRouter, "/voluntario", ["Voluntario"]],
    [PacienteRouter, "/paciente", ["Paciente"]],
    [TerapeutaRouter, "/terapeuta", ["Terapeuta"]],
    [CandidatoRouter, "/candidato", ["Candidato"]],
    [AdministradorRouter, "/administrador", ["Administrador"]],
]
