from .pago_router import PagoRouter
from .cobro_router import CobroRouter

routes_list = [
    [PagoRouter, "/pago", ["Pago"]],
    [CobroRouter, "/cobro", ["Cobro"]],
]
