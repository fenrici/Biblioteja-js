/**
 * Módulo principal de la aplicación
 */
class BookLibraryApp {
    constructor() {
        // Elementos del DOM
        this.loader = document.getElementById('loader');
        this.categoriesContainer = document.getElementById('categories-container');
        this.booksContainer = document.getElementById('books-container');
        this.categoriesList = document.getElementById('categories-list');
        this.booksList = document.getElementById('books-list');
        this.listTitle = document.getElementById('list-title');
        this.backToIndexBtn = document.getElementById('back-to-index');
        
        // Elementos de filtrado y ordenamiento
        this.categorySearch = document.getElementById('category-search');
        this.frequencyFilter = document.getElementById('frequency-filter');
        this.sortNameBtn = document.getElementById('sort-name');
        this.sortOldestBtn = document.getElementById('sort-oldest');
        this.sortNewestBtn = document.getElementById('sort-newest');
        this.titleSearch = document.getElementById('title-search');
        this.authorSearch = document.getElementById('author-search');
        this.sortTitleBtn = document.getElementById('sort-title');
        this.sortAuthorBtn = document.getElementById('sort-author');
        
        // Elementos de paginación
        this.prevPageBtn = document.getElementById('prev-page');
        this.nextPageBtn = document.getElementById('next-page');
        this.pageInfo = document.getElementById('page-info');
        
        // Estado
        this.categories = [];
        this.filteredCategories = [];
        this.currentBooks = [];
        this.filteredBooks = [];
        this.currentPage = 1;
        this.booksPerPage = 5;
        this.currentCategory = null;
        
        // Vincular eventos
        this.bindEvents();
        
        // Inicializar aplicación
        this.init();
    }
    
    /**
     * Inicializar la aplicación
     */
    async init() {
        try {
            this.showLoader();
            await this.loadCategories();
            this.hideLoader();
        } catch (error) {
            console.error('Error al iniciar la aplicación:', error);
            this.hideLoader();
            this.showError('Error al cargar las categorías. Por favor, recarga la página.');
        }
    }
    
    /**
     * Vincular eventos
     */
    bindEvents() {
        // Eventos de la vista de categorías
        this.backToIndexBtn.addEventListener('click', () => this.showCategoriesView());
        this.categorySearch.addEventListener('input', () => this.filterCategories());
        this.frequencyFilter.addEventListener('change', () => this.filterCategories());
        this.sortNameBtn.addEventListener('click', () => this.sortCategories('name'));
        this.sortOldestBtn.addEventListener('click', () => this.sortCategories('oldest'));
        this.sortNewestBtn.addEventListener('click', () => this.sortCategories('newest'));
        
        // Eventos de la vista de libros
        this.titleSearch.addEventListener('input', () => this.filterBooks());
        this.authorSearch.addEventListener('input', () => this.filterBooks());
        this.sortTitleBtn.addEventListener('click', () => this.sortBooks('title'));
        this.sortAuthorBtn.addEventListener('click', () => this.sortBooks('author'));
        
        // Eventos de paginación
        this.prevPageBtn.addEventListener('click', () => this.prevPage());
        this.nextPageBtn.addEventListener('click', () => this.nextPage());
    }
    
    /**
     * Cargar categorías desde la API
     */
    async loadCategories() {
        try {
            this.categories = await api.getLists();
            this.filteredCategories = [...this.categories];
            this.renderCategories();
        } catch (error) {
            console.error('Error al cargar categorías:', error);
            throw error;
        }
    }
    
    /**
     * Renderizar categorías en la página
     */
    renderCategories() {
        this.categoriesList.innerHTML = '';
        
        if (this.filteredCategories.length === 0) {
            this.categoriesList.innerHTML = '<p class="no-results">No se encontraron categorías que coincidan con tu búsqueda.</p>';
            return;
        }
        
        this.filteredCategories.forEach(category => {
            const categoryCard = document.createElement('div');
            categoryCard.className = 'category-card';
            
            categoryCard.innerHTML = `
                <h3>${category.display_name}</h3>
                <div class="category-info">
                    <p><strong>Fecha más antigua:</strong> ${api.formatDate(category.oldest_published_date)}</p>
                    <p><strong>Fecha más reciente:</strong> ${api.formatDate(category.newest_published_date)}</p>
                    <p><strong>Frecuencia:</strong> ${category.updated === 'WEEKLY' ? 'Semanal' : 'Mensual'}</p>
                </div>
                <button class="read-more">READ MORE! ▶</button>
            `;
            
            const readMoreBtn = categoryCard.querySelector('.read-more');
            readMoreBtn.addEventListener('click', () => this.loadBooksList(category));
            
            this.categoriesList.appendChild(categoryCard);
        });
    }
    
    /**
     * Filtrar categorías basado en búsqueda y filtro de frecuencia
     */
    filterCategories() {
        const searchTerm = this.categorySearch.value.toLowerCase();
        const frequency = this.frequencyFilter.value;
        
        this.filteredCategories = this.categories.filter(category => {
            const matchesSearch = category.display_name.toLowerCase().includes(searchTerm);
            const matchesFrequency = frequency === 'all' || category.updated === frequency;
            
            return matchesSearch && matchesFrequency;
        });
        
        this.renderCategories();
    }
    
    /**
     * Ordenar categorías basado en criterios
     
     */
    sortCategories(criteria) {
        switch (criteria) {
            case 'name':
                this.filteredCategories.sort((a, b) => 
                    a.display_name.localeCompare(b.display_name)
                );
                break;
            case 'oldest':
                this.filteredCategories.sort((a, b) => 
                    new Date(a.oldest_published_date) - new Date(b.oldest_published_date)
                );
                break;
            case 'newest':
                this.filteredCategories.sort((a, b) => 
                    new Date(b.newest_published_date) - new Date(a.newest_published_date)
                );
                break;
        }
        
        this.renderCategories();
    }
    
    /**
     * Cargar lista de libros para una categoría específica
     * @param {Object} category - Objeto de categoría
     */
    async loadBooksList(category) {
        try {
            this.showLoader();
            this.currentCategory = category;
            
            const result = await api.getBooksByList(category.list_name_encoded);
            this.currentBooks = result.books || [];
            this.filteredBooks = [...this.currentBooks];
            
            this.currentPage = 1;
            this.showBooksView(category.display_name);
            this.renderBooks();
            
            this.hideLoader();
        } catch (error) {
            console.error('Error al cargar la lista de libros:', error);
            this.hideLoader();
            this.showError('Error al cargar los libros. Por favor, inténtalo de nuevo.');
        }
    }
    
    /**
     * Renderizar libros en la página
     */
    renderBooks() {
        this.booksList.innerHTML = '';
        
        if (this.filteredBooks.length === 0) {
            this.booksList.innerHTML = '<p class="no-results">No se encontraron libros que coincidan con tu búsqueda.</p>';
            this.updatePagination();
            return;
        }
        
        // Calcular paginación
        const startIndex = (this.currentPage - 1) * this.booksPerPage;
        const paginatedBooks = this.filteredBooks.slice(startIndex, startIndex + this.booksPerPage);
        
        paginatedBooks.forEach((book, index) => {
            const rank = startIndex + index + 1;
            const bookCard = document.createElement('div');
            bookCard.className = 'book-card';
            
            const amazonLink = book.amazon_product_url || '#';
            
            bookCard.innerHTML = `
                <div class="book-cover">
                    <img src="${book.book_image || 'https://via.placeholder.com/150x225?text=No+Image'}" alt="${book.title}">
                    <div class="book-rank">#${book.rank}</div>
                    <div class="book-weeks">Semanas en lista: ${book.weeks_on_list}</div>
                </div>
                <div class="book-info">
                    <h3 class="book-title">${book.title}</h3>
                    <p class="book-author">Por ${book.author}</p>
                    <p class="book-description">${book.description || 'No hay descripción disponible.'}</p>
                    <a href="${amazonLink}" class="buy-button" target="_blank">BUY AT AMAZON ▶</a>
                </div>
            `;
            
            this.booksList.appendChild(bookCard);
        });
        
        this.updatePagination();
    }
    
    /**
     * Actualizar controles de paginación
     */
    updatePagination() {
        const totalPages = Math.ceil(this.filteredBooks.length / this.booksPerPage);
        this.pageInfo.textContent = `Página ${this.currentPage} de ${totalPages || 1}`;
        
        this.prevPageBtn.disabled = this.currentPage <= 1;
        this.nextPageBtn.disabled = this.currentPage >= totalPages || totalPages === 0;
    }
    
    /**
     * Ir a la página anterior
     */
    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderBooks();
            window.scrollTo(0, 0);
        }
    }
    
    
     //Ir a la página siguiente
     
    nextPage() {
        const totalPages = Math.ceil(this.filteredBooks.length / this.booksPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderBooks();
            window.scrollTo(0, 0);
        }
    }
    
    
     //Filtrar libros basado en búsqueda por título y autor
     
    filterBooks() {
        const titleSearchTerm = this.titleSearch.value.toLowerCase();
        const authorSearchTerm = this.authorSearch.value.toLowerCase();
        
        this.filteredBooks = this.currentBooks.filter(book => {
            const matchesTitle = book.title.toLowerCase().includes(titleSearchTerm);
            const matchesAuthor = book.author.toLowerCase().includes(authorSearchTerm);
            
            return matchesTitle && matchesAuthor;
        });
        
        this.currentPage = 1;
        this.renderBooks();
    }
    
    
     //Ordenar libros basado en criterios
    
    sortBooks(criteria) {
        switch (criteria) {
            case 'title':
                this.filteredBooks.sort((a, b) => 
                    a.title.localeCompare(b.title)
                );
                break;
            case 'author':
                this.filteredBooks.sort((a, b) => 
                    a.author.localeCompare(b.author)
                );
                break;
        }
        
        this.renderBooks();
    }
    
    
     //Mostrar vista de categorías
     
    showCategoriesView() {
        this.booksContainer.classList.add('hidden');
        this.categoriesContainer.classList.remove('hidden');
        
        // Limpiar filtros de libros
        this.titleSearch.value = '';
        this.authorSearch.value = '';
    }
    
    
     // Mostrar vista de libros
     
    showBooksView(categoryName) {
        this.categoriesContainer.classList.add('hidden');
        this.booksContainer.classList.remove('hidden');
        this.listTitle.textContent = categoryName;
    }
    
    
     //Mostrar cargador
     
    showLoader() {
        this.loader.classList.remove('hidden');
    }
    
    /**
     * Ocultar cargador
     */
    hideLoader() {
        this.loader.classList.add('hidden');
    }
    
    
     // Mostrar mensaje de error
     
    showError(message) {
        alert(message);
    }
}

// Inicializar la aplicación cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    new BookLibraryApp();
}); 