
// Seleciona todos os elementos que têm o atributo data-bs-toggle="popover"
const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
    
// Cria uma instância de Popover para cada elemento encontrado
const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
