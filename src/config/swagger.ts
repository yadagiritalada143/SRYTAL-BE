const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'SRYTAL Backend API Documentation',
            version: '1.0.0',
            description: 'API documentation for managing SRYTAL APIs',
        },
        servers: [
            {
                url: 'http://localhost:3000/',
                description: 'Development Server',
            },
            {
                url: 'https://srytal-api.vercel.app/',
                description: 'Production Server',
            },
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer', // Use the Bearer authentication scheme
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: ['./src/routes/**/*.ts'], // Path where routes are defined and Swagger annotations are added
};

export default swaggerOptions;
