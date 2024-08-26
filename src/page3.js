import * as THREE from 'three'; 
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {FBXLoader} from 'three/addons/loaders/FBXLoader.js';
import {RGBELoader} from 'three/addons/loaders/RGBELoader.js';
import {AnimationMixer} from 'three/src/animation/AnimationMixer.js';
import { HorizontalBlurShader } from 'three/addons/shaders/HorizontalBlurShader.js';
import { VerticalBlurShader } from 'three/addons/shaders/VerticalBlurShader.js';

import {AnimationLoader} from 'three/src/loaders/AnimationLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';


let scene, camera, renderer,model,birdmodel,mixer,orbit,fbxLoader,Head;
let cloudTexture,moontexture;
let minY = 0;
let maxY = 100;
let action=[];
let mouseX = 0;
let mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
let totalSprites = 10000; // Change this value to control total planes
let sprites = [];
let spawnProbability = 100
var clock = new THREE.Clock();
let HDRI;

function init()
{
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75,  window.innerWidth / window.innerHeight, 0.001, 1000);
    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(window.innerWidth,window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    document.body.appendChild(renderer.domElement);
    camera.fov=500;

    const light = new THREE.AmbientLight( 0xFFFFFF ); // soft white light
    const directionalLight1 = new THREE.DirectionalLight( 0xffffff, 2 );
    directionalLight1.position.set(0.5,2.5,0);
    directionalLight1.lookAt(0,2,0);
    directionalLight1.castShadow=true;
    directionalLight1.shadow.mapSize.width = 2048; // Set to appropriate values for your scene
    directionalLight1.shadow.mapSize.height = 2048;
    directionalLight1.shadow.camera.near = 0.5;
    directionalLight1.shadow.camera.far = 50;
    directionalLight1.shadow.radius =5;
    directionalLight1.shadow.blurSamples = 15;
    scene.add( directionalLight1 );
    scene.add( light );
    
    

    var canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var context = canvas.getContext('2d');

// Define gradient
    var gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#000000'); // dark
    gradient.addColorStop(0.8, '#1D376F');//light
    gradient.addColorStop(1, '#343D50'); // lightest

// Fill the canvas with the gradient
   context.fillStyle = gradient;
   context.fillRect(0, 0, canvas.width, canvas.height);

// Create a texture from the canvas
    var gradientTexture = new THREE.CanvasTexture(canvas);

     // Set default background color (in case the gradient doesn't fill the entire background)
    scene.background = gradientTexture;
    
    //orbit = new OrbitControls(camera, renderer.domElement);
    //orbit.enableDamping=true;
    //orbit.dampingFactor=0.5;
    //orbit.update();
    camera.position.set(0,1.7,1);
    camera.lookAt(0,1.5,-0.5);
    
    var loader = new GLTFLoader();
        loader.load('./models/avataar.glb', function (gltf) {
            
            gltf.scene.traverse(child =>{
                if(child instanceof THREE.Mesh)
                {
                    const physicalMaterial= new THREE.MeshPhysicalMaterial();
                    for (const key in child.material) 
                    {
                        if (child.material.hasOwnProperty(key)) 
                        { 
                            physicalMaterial[key]=child.material[key];
                        }
                    }
                    
                }

            });
            model = gltf.scene;
            scene.add(model);
            model.rotation.y=Math.PI;
            mixer = new AnimationMixer(model);
            fbxLoader = new FBXLoader();
            fbxLoader.load('./animations/Flying.fbx', function (animation1) 
            {
                action[0]= mixer.clipAction(animation1.animations[0]); 
                action[0].play();
        }); 
        }); 

        
            
        
        const directionalLight2 = new THREE.DirectionalLight( 0xffffff, 2 );
        directionalLight2.position.set(-4,2.5,0);
        directionalLight1.lookAt(15,-1,-5);
        scene.add(directionalLight2);  
        
    const hdriTextureLoader = new RGBELoader().load('./Hdri/107_hdrmaps_com_free_10K.hdr', texture => {
        
        const gen = new THREE.PMREMGenerator(renderer);
        HDRI= gen.fromEquirectangular(texture).texture;
        scene.environment =HDRI ;
        scene.background=HDRI;
        scene.backgroundRotation.y=Math.PI/2;
        scene.environmentRotation.y=Math.PI/2;
        texture.dispose();
        gen.dispose();
      });

    const textureLoader = new THREE.TextureLoader();
    cloudTexture = textureLoader.load('./textures/ulap.png');
    cloudTexture.wrapS = THREE.RepeatWrapping;
    cloudTexture.wrapT = THREE.RepeatWrapping;

    moontexture=textureLoader.load('./textures/moon.png');
    cloudTexture.wrapS = THREE.RepeatWrapping;
    cloudTexture.wrapT = THREE.RepeatWrapping;
    
    /*const size = 5;
    //const spriteMap = new THREE.TextureLoader().load('./textures/sprite.png');
    const spriteMaterial = new THREE.SpriteMaterial({ map: moontexture, transparent: true, opacity: 1 });
    const moon = new THREE.Sprite(spriteMaterial);
    moon.scale.set(size, size, 1); // Adjust scale as needed
    scene.add(moon);
    moon.position.set(6,2,-10);*/
        
}


function onMouseMove(event) {

    mouseX = ( event.clientX - windowHalfX ) / 100;
	mouseY = ( event.clientY - windowHalfY ) / 100;
}

/*function createPlane() {
    const size = Math.random() * 2 + 1;
    const geometry = new THREE.PlaneGeometry(size,size); // Adjust size as needed
    const material = new THREE.MeshBasicMaterial({ map: cloudTexture, transparent: true, opcity: 0.5 });
    const plane = new THREE.Mesh(geometry, material);
    return plane;
}*/
function createSprite() {
    const size = Math.random() * 2 + 1;
    //const spriteMap = new THREE.TextureLoader().load('./textures/sprite.png');
    const spriteMaterial = new THREE.SpriteMaterial({ map: cloudTexture, transparent: true, opacity: 0.5 });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(size, size, 1); // Adjust scale as needed
    return sprite;
}
/*function updatePlanes(planes) {
    const removeIndices = [];
    planes.forEach((plane, index) => {
        plane.position.z += 0.05; // Move in the +z direction
        if (plane.position.z > 10) {
            removeIndices.push(index);
            scene.remove(plane);
        }
    });

    // Remove planes that crossed z = 5
    removeIndices.reverse().forEach(index => planes.splice(index, 1));

    // Respawn planes
    if (planes.length < totalPlanes && Math.random() < spawnProbability){
        const plane = createPlane();
        const x = Math.random() * 20 - 10; // Random x-coordinate between -5 and 5
        const y = Math.random() * 3- 2; // Random y-coordinate between -2 and 4
        const z = Math.random() * 5- 20; // Initial z-coordinate
        plane.position.set(x, y, z);
        plane.rotation.z = Math.random() * Math.PI * 2; // Random rotation about x-axis
        scene.add(plane);
        planes.push(plane);
    }
}*/
function updateSprites(sprites) {
    const removeIndices = [];
    sprites.forEach((sprite, index) => {
        sprite.position.z += 0.05; // Move in the +z direction
        if (sprite.position.z > 10) {
            removeIndices.push(index);
            scene.remove(sprite);
        }
    });

    // Remove sprites that crossed z = 5
    removeIndices.reverse().forEach(index => sprites.splice(index, 1));

    // Respawn sprites
    if (sprites.length < totalSprites && Math.random() < spawnProbability){
        const sprite = createSprite();
        const x = Math.random() * 50 - 25; // Random x-coordinate between -5 and 5
        const y = Math.random() * 3- 2; // Random y-coordinate between -2 and 4
        const z = Math.random() * 5- 20; // Initial z-coordinate
        sprite.position.set(x, y, z);
        scene.add(sprite);
        sprites.push(sprite);
    }
}


function animate() 
{
    requestAnimationFrame(animate);

    if (mixer) {
        var delta = clock.getDelta();
        mixer.update(delta); // Update the mixer
    }
    updateSprites(sprites);
    //updateBoneRotation();
    renderer.render(scene, camera);
    camera.position.x += ( mouseX - camera.position.x ) * .05;
    camera.position.y += ( - mouseY - camera.position.y ) * .05;
    //model.position.y=camera.position.y-1.5;
    //camera.lookAt(0,model.position.y,0.5);
    
    camera.lookAt( 0,1.5,-0.5 );
    var currentPosition = camera.position;
    currentPosition.y = Math.max(1.5, Math.min(maxY, currentPosition.y));
    currentPosition.x=  Math.max(-2, Math.min(2, currentPosition.x));
    
}
init();
document.addEventListener('mousemove', onMouseMove, false);

//document.addEventListener('click',onMouseMove,true);
animate();