console.log('JS publico, solo para front-end')

document.addEventListener('click', e=>{
    if(e.target.dataset.short){
        const url = `${window.location.origin}/${e.target.dataset.short}`

        navigator.clipboard // copia la url
            .writeText(url)
            .then(() => { // En caso de éxito
                console.log("Copiado en el portapapeles...");
            })
            .catch((err) => { // En caso de error
                console.log("Algo salió mal", err);
            });
    }
})