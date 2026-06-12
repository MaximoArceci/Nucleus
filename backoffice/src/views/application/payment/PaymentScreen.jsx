import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useAuth } from "contexts/Auth0Context";
import axiosServices from "utils/axios";
import { Button, Card, Typography, Dialog, DialogTitle, DialogContent, DialogActions, ToggleButton, ToggleButtonGroup } from "@mui/material";
import PaymentIcon from "@mui/icons-material/Payment";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);


const availablePacks = [
    // FICHA Roja (tipo1)
    { id: 1, label: "Ficha - $50", amount: 5000, tipo: "FICHA 1", cantidadFichas: 1 },
    { id: 2, label: "Pack 3 - $140", amount: 14000, tipo: "FICHA 1", cantidadFichas: 3 },
    { id: 3, label: "Pack 5 - $225", amount: 22500, tipo: "FICHA 1", cantidadFichas: 5 },
    { id: 4, label: "Pack 10 - $400", amount: 40000, tipo: "FICHA 1", cantidadFichas: 10 },

    // FICHA Naranja (tipo2)
    { id: 5, label: "Ficha - $60", amount: 6000, tipo: "FICHA 2", cantidadFichas: 1 },
    { id: 6, label: "Pack 3 - $170", amount: 17000, tipo: "FICHA 2", cantidadFichas: 3 },
    { id: 7, label: "Pack 5 - $270", amount: 27000, tipo: "FICHA 2", cantidadFichas: 5 },
    { id: 8, label: "Pack 10 - $480", amount: 48000, tipo: "FICHA 2", cantidadFichas: 10 },

    // FICHA Verde (tipo4)
    { id: 9, label: "Ficha - $70", amount: 7000, tipo: "FICHA 3", cantidadFichas: 1 },
    { id: 10, label: "Pack 3 - $200", amount: 20000, tipo: "FICHA 3", cantidadFichas: 3 },
    { id: 11, label: "Pack 5 - $315", amount: 31500, tipo: "FICHA 3", cantidadFichas: 5 },
    { id: 12, label: "Pack 10 - $560", amount: 56000, tipo: "FICHA 3", cantidadFichas: 10 },

    // FICHA Amarillo (tipo3)
    { id: 13, label: "Ficha - $80", amount: 8000, tipo: "FICHA 4", cantidadFichas: 1 },
    { id: 14, label: "Pack 3 - $220", amount: 22000, tipo: "FICHA 4", cantidadFichas: 3 },
    { id: 15, label: "Pack 5 - $360", amount: 36000, tipo: "FICHA 4", cantidadFichas: 5 },
    { id: 16, label: "Pack 10 - $640", amount: 64000, tipo: "FICHA 4", cantidadFichas: 10 },

    // FICHA Azul (tipo5)
    { id: 17, label: "Ficha - $90", amount: 9000, tipo: "FICHA 5", cantidadFichas: 1 },
    { id: 18, label: "Pack 3 - $250", amount: 25000, tipo: "FICHA 5", cantidadFichas: 3 },
    { id: 19, label: "Pack 5 - $400", amount: 40000, tipo: "FICHA 5", cantidadFichas: 5 },
    { id: 20, label: "Pack 10 - $720", amount: 72000, tipo: "FICHA 5", cantidadFichas: 10 },

    // FICHA Blanca (tipo6)
    { id: 21, label: "Ficha - $100", amount: 10000, tipo: "FICHA 6", cantidadFichas: 1 },
    { id: 22, label: "Pack 3 - $280", amount: 28000, tipo: "FICHA 6", cantidadFichas: 3 },
    { id: 23, label: "Pack 5 - $450", amount: 45000, tipo: "FICHA 6", cantidadFichas: 5 },
    { id: 24, label: "Pack 10 - $800", amount: 80000, tipo: "FICHA 6", cantidadFichas: 10 },

    // Ficha Entrevista Inicial
    { id: 25, label: "Ficha - $100", amount: 10000, tipo: "INICIAL", cantidadFichas: 1 },
];


const CheckoutForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const { userId, tipoFicha } = useAuth();

    const [userPacks, setUserPacks] = useState([]);
    const [selectedPack, setSelectedPack] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [openSuccessModal, setOpenSuccessModal] = useState(false);
    const [openErrorModal, setOpenErrorModal] = useState(false);

    useEffect(() => {
        if (tipoFicha) {
            const filtered = availablePacks.filter(pack => pack.tipo === tipoFicha);
            setUserPacks(filtered);
            setSelectedPack(filtered[0]);
        }
    }, [tipoFicha]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedPack) return;
        setOpenModal(true);
    };

    const confirmPayment = async () => {
        setLoading(true);
        setError(null);
        setOpenModal(false);

        try {
            const { data } = await axiosServices.post("/pagos/pago/create-payment-intent/", {
                amount: selectedPack.amount,
            });
            const { clientSecret } = data;
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: { card: elements.getElement(CardElement) },
            });

            if (result.error) {
                setError(result.error.message);
                setOpenErrorModal(true);
            } else if (result.paymentIntent.status === "succeeded") {
                setSuccess(true);
                setOpenSuccessModal(true);
                await axiosServices.post("/pagos/pago", {
                    pacienteId: userId,
                    total: selectedPack.amount,
                    cantFichas: selectedPack.cantidadFichas,
                    fecha: new Date().toISOString(),
                });
            }
        } catch (error) {
            setError(error.response?.data?.message || "Error en la transacción");
            setOpenErrorModal(true);
        }
        setLoading(false);
    };

    return (
        <Card className="max-w-lg mx-auto p-6 shadow-xl rounded-xl space-y-6 bg-white">
            <Typography variant="h4" className="text-gray-800 text-center flex items-center gap-2">
                <PaymentIcon /> Compra de Fichas
            </Typography>
            {userPacks.length > 0 ? (
                <form onSubmit={handleSubmit}>
                    <Typography variant="h6" className="mb-4 flex items-center gap-2">
                        <ShoppingCartIcon /> Selecciona un pack de fichas
                    </Typography>
                    <ToggleButtonGroup
                        value={selectedPack ? selectedPack.id : ""}
                        exclusive
                        onChange={(e, value) => {
                            const pack = userPacks.find(p => p.id === value);
                            setSelectedPack(pack);
                        }}
                        className="flex flex-wrap w-full gap-2 mb-4"
                    >
                        {userPacks.map((pack) => (
                            <ToggleButton key={pack.id} value={pack.id} className="p-3 shadow-md border rounded-lg">
                                {pack.label}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                    <div className="mb-4 p-3 border rounded-md shadow-md">
                        <CardElement />
                    </div>
                    <Button type="submit" disabled={!stripe || loading} variant="contained" color="primary" fullWidth>
                        {loading ? "Procesando..." : "Pagar"}
                    </Button>
                </form>
            ) : (
                <Typography variant="body2" className="text-center text-gray-600">
                    No hay packs disponibles para tu tipo de ficha.
                </Typography>
            )}
            <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
                <DialogTitle>Confirmar Pago</DialogTitle>
                <DialogContent>
                    <Typography>¿Deseas confirmar el pago de {selectedPack?.label}?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenModal(false)} color="secondary">Cancelar</Button>
                    <Button onClick={confirmPayment} color="primary" variant="contained">Confirmar</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openSuccessModal} onClose={() => setOpenSuccessModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle><CheckCircleIcon color="success" /> Pago Exitoso</DialogTitle>
                <DialogContent>
                    <Typography variant="h6" color="success.main">¡Tu pago ha sido procesado correctamente!</Typography>
                </DialogContent>
            </Dialog>
            <Dialog open={openErrorModal} onClose={() => setOpenErrorModal(false)} maxWidth="xs">
                <DialogTitle><ErrorIcon color="error" /> Error en el Pago</DialogTitle>
                <DialogContent>
                    <Typography>{error}</Typography>
                </DialogContent>
            </Dialog>
        </Card>
    );
};

const StripeWrapper = () => (
    <Elements stripe={stripePromise}>
        <CheckoutForm />
    </Elements>
);

export default StripeWrapper;
