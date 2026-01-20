const testLogin = async () => {
    try {
        console.log('🧪 Probando login...')

        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'profesor@test.com',
                password: 'test123'
            })
        })

        const data = await response.json()

        console.log('📊 Respuesta:', {
            status: response.status,
            ok: response.ok,
            data
        })

        const cookies = response.headers.get('set-cookie')
        console.log('🍪 Cookies:', cookies)

        if (response.ok) {
            console.log('✅ LOGIN EXITOSO!')
            console.log('Usuario:', data.user)
        } else {
            console.log('❌ LOGIN FALLIDO:', data.error)
        }
    } catch (error) {
        console.error('💥 Error:', error)
    }
}

testLogin()
