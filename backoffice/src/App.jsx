import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router";
import Loader from "ui-component/Loader";
import AppRouter from "routes/router";
import Landing from "views/pages/Landing/pages/Landing";




const CalendarComponent = () => {

  return (
    <Suspense fallback={<Loader />}>

        <AppRouter />


    </Suspense>
  );
};

export default CalendarComponent;
