let scene, camera, renderer, controls;

let modelUrl = 'models/soap.gltf';
let planeTextureUrl = 'textures/marble.jpg';
let skyboxTextureUrls = [
    'textures/posx.jpg',
    'textures/negx.jpg',
    'textures/posy.jpg',
    'textures/negy.jpg',
    'textures/posz.jpg',
    'textures/negz.jpg'
];
let dracoPath = '../js/draco/';

function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 3, 45);
    camera.position.set(13, 13, 13);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.gammaOutput = true;
    renderer.gammaFactor = 2.2;
    renderer.setClearColor(0xE5E5E5);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.update = false;
    renderer.sortObjects = false;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.autoClear = true;
    document.body.appendChild(renderer.domElement);
    
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableKeys = false;
    controls.enablePan = false;
    controls.maxDistance = 30;
    controls.minDistance = 12;
    controls.enableDamping = true;

    let light = new THREE.PointLight(0xFFFFFF, .5, 1000);
    light.position.set(0, 15, 30);
    light.castShadow = true;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    light.shadow.camera.near = 30;
    light.shadow.camera.far = 45;
    scene.add(light);

    light = new THREE.AmbientLight(0xFFFFFF, .75);
    scene.add(light);

    let textureLoader = new THREE.CubeTextureLoader();
    scene.background = textureLoader.load(skyboxTextureUrls);

    reflectionCamera = new THREE.CubeCamera(1, 500, 500);
    reflectionCamera.position.set(0, 100, 0);
    scene.add(reflectionCamera);

    let reflectionMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xA3A3A3,
        envMap: reflectionCamera.renderTarget.texture,
		roughness: .5,
		reflectivity: 1
    });

    let geometry = new THREE.BoxBufferGeometry(19, .1, 19, 100, 100);
    let texture = new THREE.TextureLoader().load(planeTextureUrl);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat = new THREE.Vector2(5, 5);
    let material = new THREE.MeshPhysicalMaterial( {
        map: texture,
        roughness: .95,
        reflectivity: 0
    });
    let plane = new THREE.Mesh(geometry, material);
    plane.receiveShadow = true;
    plane.matrixAutoUpdate = false;
    scene.add(plane);

    let gltfLoader = new THREE.GLTFLoader();

    let dracoLoader = new THREE.DRACOLoader();
    dracoLoader.setDecoderPath(dracoPath);
    gltfLoader.setDRACOLoader(dracoLoader);

    gltfLoader.load(modelUrl, gltf => {
        gltf.scene.children[0].children[0].material = new THREE.MeshPhysicalMaterial({
            color: 0x2b2b2b,
            roughness: .5,
            reflectivity: .5
        });
        gltf.scene.children[0].children[2].material = reflectionMaterial;
        for (index in gltf.scene.children[0].children) {
            gltf.scene.children[0].children[index].castShadow = true;
        }
        gltf.scene.matrixAutoUpdate = false;
        scene.add(gltf.scene);
    });

    let renderPass = new THREE.RenderPass(scene, camera);
    
    let composer = new THREE.EffectComposer(renderer);
    composer.addPass(renderPass);
    
    renderPass.renderToScreen = true;

    animate();

    function animate() {
        requestAnimationFrame(animate);

        controls.update();
        
        reflectionCamera.update(renderer, scene);
    
        composer.render();
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize, false);

init();