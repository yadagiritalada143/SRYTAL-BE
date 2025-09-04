const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Course Management API',
            version: '1.0.0',
            description: 'API documentation for managing courses, modules, and tasks',
        },
        servers: [
            {
                url: 'http://localhost:3000/', // Your API base URL
                description: 'Development Server',
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
