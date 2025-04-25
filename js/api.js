
 // Servicio de API para la API de Books del New York Times
 
class NYTimesAPI {
    constructor() {
        this.apiKey = 'tvWxVbA3qU6TDU2WgxzR23TJ3q3h8N3S';
        this.baseUrl = 'https://api.nytimes.com/svc/books/v3';
    }

    
     // Obtener todas las listas disponibles
     
    async getLists() {
        try {
            const url = `${this.baseUrl}/lists/names.json?api-key=${this.apiKey}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            return data.results;
        } catch (error) {
            console.error('Error al obtener las listas:', error);
            throw error;
        }
    }


    // Obtener libros de una lista específica

    async getBooksByList(listName) {
        try {
            const url = `${this.baseUrl}/lists/current/${listName}.json?api-key=${this.apiKey}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            return data.results;
        } catch (error) {
            console.error(`Error al obtener los libros para la lista ${listName}:`, error);
            throw error;
        }
    }


    //Obtener libros de una lista específica y fecha

    async getBooksByListAndDate(listName, date) {
        try {
            const url = `${this.baseUrl}/lists/${date}/${listName}.json?api-key=${this.apiKey}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            return data.results;
        } catch (error) {
            console.error(`Error al obtener los libros para la lista ${listName} en la fecha ${date}:`, error);
            throw error;
        }
    }


    // Formatear fecha para mostrar en la UI

    formatDate(dateString) {
        if (!dateString) return 'N/A';

        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }
}

// Crear una instancia singleton
const api = new NYTimesAPI(); 