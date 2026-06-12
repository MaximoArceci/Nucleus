import React from 'react'

function PrivacyPolicy() {
  return (
    <html>
    <head><title>Política de Privacidad</title></head>
    <body>
      <h1>Política de Privacidad</h1>
      <p>Esta aplicación utiliza servicios de Google como autenticación de usuario, Google Calendar, Google Meet y Gmail para brindar funcionalidades esenciales al usuario.</p>
    
      <h2>Información que recopilamos</h2>
      <p>Recopilamos y utilizamos los siguientes datos personales de tu cuenta de Google, únicamente con fines funcionales:</p>
      <ul>
        <li>Tu nombre y foto de perfil de Google, para mostrar tu identidad dentro de la aplicación.</li>
        <li>Tu dirección de correo electrónico de Google, utilizada para enviar correos electrónicos desde la aplicación.</li>
        <li>Eventos de tu calendario de Google (lectura y escritura), utilizados para visualizar y programar reuniones, incluyendo la generación de enlaces de Google Meet.</li>
      </ul>
    
      <h2>Cómo usamos tu información</h2>
      <p>Utilizamos tu información personal exclusivamente para:</p>
      <ul>
        <li>Mostrar tu nombre e imagen en la interfaz de la aplicación.</li>
        <li>Leer y crear eventos en tu Google Calendar.</li>
        <li>Enviar correos electrónicos desde tu cuenta mediante la API de Gmail, cuando así lo requiera la funcionalidad de la aplicación.</li>
      </ul>
    
      <h2>Seguridad y protección de datos</h2>
      <p>Nos tomamos muy en serio la seguridad de tus datos. Aplicamos las siguientes medidas de protección:</p>
      <ul>
        <li>Todos los datos se transmiten mediante conexiones seguras (HTTPS/TLS).</li>
        <li>No almacenamos tu información personal en servidores propios.</li>
        <li>Los datos son procesados en tiempo real únicamente para los fines funcionales mencionados.</li>
        <li>El acceso a tus datos se limita estrictamente a lo necesario para el funcionamiento de la aplicación y está protegido mediante autenticación segura.</li>
      </ul>
    
      <h2>Retención y eliminación de datos</h2>
      <p>Dado que no almacenamos datos personales en servidores, no conservamos tu información una vez finalizado el uso funcional. Si deseas revocar el acceso, podés hacerlo en cualquier momento (ver abajo).</p>
    
      <h2>Compartición de datos</h2>
      <p>No compartimos tu información personal con terceros bajo ninguna circunstancia.</p>
    
      <h2>Revocación de permisos</h2>
      <p>Podés revocar el acceso a tu cuenta de Google en cualquier momento desde: <a href="https://myaccount.google.com/permissions">https://myaccount.google.com/permissions</a></p>
    
      <h2>Contacto</h2>
      <p>Si tenés preguntas o inquietudes sobre esta política, podés contactarnos en: 45minutesonline@gmail.com</p>
    </body>
    </html>
  );
}

export default PrivacyPolicy;