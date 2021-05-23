const {ipcRenderer}=require('electron')
var dragFile= document.getElementById("drag-file");
var error= document.getElementById("error");
var error2= document.getElementById("error2");
var loading= document.getElementById("loading");
var textTitle= document.getElementById("textTitle");
var textSubtitle= document.getElementById("textSubtitle");
var textExtension= document.getElementById("textExtension");

var selectedOption = 1

dragFile.addEventListener('drop', function (e) {
    e.preventDefault();
    e.stopPropagation();
    error2.style.display = "none"
    for (let f of e.dataTransfer.files) {
        console.log('The file(s) you dragged: ', f.path)
        // console.log('start loading')
        const extension = f.path.split('.').pop()

        var extOption = 'fbx'
        var dracoOption = ''
        switch (selectedOption) {
            case 1:
                extOption = 'fbx'
                break;
            case 2:
                extOption = 'glb'
                break;
            case 3:
                extOption = 'gltf'
                break;
            case 4:
                var dracoCompressLevel = document.getElementById('dracoCompressLevel').value
                var dracoCompressMeshes = document.getElementById('dracoCompressMeshes').value
                dracoOption = {compressionLevel: dracoCompressLevel, compressMeshes: dracoCompressMeshes}
                extOption = 'gltf'
                break;
        }

        if(extension.toLowerCase() == extOption) {
            error.style.display = "none"
            dragFile.style.display = "none"
            loading.style.display = "flex"
            ipcRenderer.send('ondragstart', f.path, selectedOption, dracoOption)
        } else {
            error.style.display = "block"
        }
    }
});

dragFile.addEventListener('dragover', function (e) {
    e.preventDefault();
    e.stopPropagation();
});

ipcRenderer.on('convertdone', (event, data) => { 
    // console.log('end loading')
    loading.style.display = "none"
    dragFile.style.display = "flex"
})

ipcRenderer.on('converterror', (event, data) => { 
    // console.log('end loading')
    loading.style.display = "none"
    dragFile.style.display = "flex"
    error2.style.display = "block"
})


//options
function changeoption(option) {
    document.getElementById('modaldraco').classList.remove('show')
    error.style.display = "none"
    var elements = document.querySelectorAll('.optionlist');
    for (var i = 0; i < elements.length; i++) {
        elements[i].classList.remove('active');
    }
    var title = 'Drag your .fbx file here'
    var subtitle = 'Convert your fbx file to glb'
    var extOption = 'fbx'
    switch (option) {
        case 1:
            selectedOption = 1
            document.getElementById('option1').classList.add('active')
            title = 'Drag your .fbx file here'
            subtitle = 'Convert your FBX file to GLB'
            extOption = 'fbx'
            break;
        case 2:
            selectedOption = 2
            document.getElementById('option2').classList.add('active')
            title = 'Drag your .glb file here'
            subtitle = 'Convert your GLB file to glTF'
            extOption = 'glb'
            break;
        case 3:
            selectedOption = 3
            document.getElementById('option3').classList.add('active')
            title = 'Drag your .glTF file here'
            subtitle = 'Convert your glTF file to GLB'
            extOption = 'gltf'
            break;
        case 4:
            selectedOption = 4
            document.getElementById('option4').classList.add('active')
            title = 'Drag your .glTF file here'
            subtitle = 'Convert your glTF file to draco glTF'
            extOption = 'gltf'
            document.getElementById('modaldraco').classList.add('show')
            break;
    }
    textTitle.innerHTML = title
    textSubtitle.innerHTML = subtitle
    textExtension.innerHTML = extOption
}

function dracoSave() {
    document.getElementById('modaldraco').classList.remove('show')
}