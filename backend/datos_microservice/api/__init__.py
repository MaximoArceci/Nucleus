from .paciente_router import PacienteRouter
from .terapeuta_router import TerapeutaRouter
from .candidato_router import CandidatoRouter
from .administrador_router import AdministradorRouter

routes_list = [
    [PacienteRouter, "/paciente", ["Paciente"]],
    [TerapeutaRouter, "/terapeuta", ["Terapeuta"]],
    [CandidatoRouter, "/candidato", ["Candidato"]],
    [AdministradorRouter, "/administrador", ["Administrador"]],
]
