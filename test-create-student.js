const http = require('http');

// Configuración
const EMAIL = 'profesor@test.com';
const PASSWORD = 'test123';

async function testFlow() {
    try {
        console.log("1. Iniciando sesión...");

        const loginRes = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: EMAIL, password: PASSWORD })
        });

        console.log("Login Status:", loginRes.status);

        console.log("--- Headers recibidos ---");
        loginRes.headers.forEach((val, key) => {
            console.log(`${key}: ${val}`);
        });
        console.log("-------------------------");

        const cookie = loginRes.headers.get('set-cookie');

        if (!cookie) {
            console.error("No se recibió cookie de sesión. Abortando.");
            return;
        }

        const sessionCookie = cookie.split(';')[0];
        console.log("Usando cookie:", sessionCookie);

        console.log("\n2. Intentando crear estudiante...");

        const studentData = {
            name: "Estudiante Test API",
            dob: "2015-01-01",
            notes: "Creado desde script de prueba"
        };

        const createRes = await fetch('http://localhost:3000/api/students', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': sessionCookie
            },
            body: JSON.stringify(studentData)
        });

        console.log("Create Student Status:", createRes.status);
        const text = await createRes.text();
        console.log("Response:", text);

    } catch (error) {
        console.error("Error en el script de prueba:", error);
    }
}

testFlow();
