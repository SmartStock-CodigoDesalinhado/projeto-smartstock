

 @param {string} pageId 

function switchPage(pageId) {

    const pages = document.querySelectorAll('.view-page');
    
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    const targetId = `page-${pageId}`;
    const targetPage = document.getElementById(targetId);
    
    if (targetPage) {
        targetPage.classList.add('active');
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        console.warn(`A tela com o ID "${targetId}" ainda não foi adicionada ao HTML.`);
    }
}