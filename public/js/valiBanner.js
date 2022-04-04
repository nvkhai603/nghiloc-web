window.onload = () => {
    form = document.getElementById('upload-file');
    form.addEventListener("submit", (e) => {
        console.log(form.file.value);
        const ext = getExt(form.file.value);
        console.log(ext);
        if(ext != "jpg" && ext != "png"){
            e.preventDefault();
            document.getElementById('warning-file').innerText = 'File upload phải có định dạng ảnh (.png hoặc .jpg).'
        }
        
    })
}
function getExt(filename) {
    var dot_pos = filename.lastIndexOf(".");
    if (dot_pos == -1) {
        return "";
    }
    return filename.substr(dot_pos + 1).toLowerCase();
}