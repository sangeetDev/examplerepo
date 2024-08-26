import * as THREE from 'three'; 
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {FBXLoader} from 'three/addons/loaders/FBXLoader.js';
import {RGBELoader} from 'three/addons/loaders/RGBELoader.js';
import TWEEN from 'three/addons/libs/tween.module.js';
import { HorizontalBlurShader } from 'three/addons/shaders/HorizontalBlurShader.js';
import { VerticalBlurShader } from 'three/addons/shaders/VerticalBlurShader.js';
import {AnimationMixer} from 'three/src/animation/AnimationMixer.js'
import {AnimationLoader} from 'three/src/loaders/AnimationLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

let scene, camera, renderer,model,model2, mixer,orbit,fbxLoader,Head;
let minY = 0;
let maxY = 100;
let mouseX = 0;
let mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
var clock = new THREE.Clock();
let zoomMin = 0.5;
let zoomMax = 2.5;
let zoomSpeed = 0.01; // Adjust this value to control the speed of the zoom
let zoomingIn = true; // Direction of zoom
const matFloor = new THREE.MeshPhongMaterial( { color: 0xffffff } );
const geoFloor = new THREE.PlaneGeometry( 100, 100 );
const mshFloor = new THREE.Mesh( geoFloor, matFloor );
mshFloor.rotation.x = - Math.PI * 0.5;

const spotLight1 = createSpotlight( /*0xF3D148*/0x0FFE00 );
const spotLight2 = createSpotlight( /*0xF3D148*/0x0045FE );
const spotLight3 = createSpotlight( /*0xF3D148*/0xFE000F );


function init()
{
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75,  window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({antialias:true});
    let action=[];
    renderer.toneMapping = THREE.ACESFilmicToneMapping ;
	renderer.toneMappingExposure = Math.pow( 0.8, 1.0 );
    renderer.setSize(window.innerWidth,window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);
    camera.fov=500;
    scene.background = new THREE.Color(0x000000);
    
    spotLight1.position.set( 2.5, 4, -1.5 );
    spotLight2.position.set( 0, 4, -2.5 );
    spotLight3.position.set( - 2.5, 4, -1.5 );

    mshFloor.receiveShadow = true;
    mshFloor.position.set( 0, 0, 0 );

    scene.add( mshFloor );
    scene.add( spotLight1, spotLight2, spotLight3 );

    

    const hdriTextureLoader = new RGBELoader().load('./models/scythian_tombs_2_4k.hdr', texture => {
        
        const gen = new THREE.PMREMGenerator(renderer);
        const HDRI= gen.fromEquirectangular(texture).texture;
        scene.environment =HDRI ;
        //scene.environmentIntensity=0.01;
        scene.environmentRotation.y=-Math.PI/2;

        texture.dispose();
        gen.dispose();
        //gen2.dispose();
      });

    orbit = new OrbitControls(camera, renderer.domElement);
    camera.position.set(0,1,2);
    camera.rotation.x=-0.5;
    orbit.enableDamping=true;
    orbit.dampingFactor=1;
    orbit.update();
    orbit.target.set(0,0.9,0);
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
            model.traverse(child =>{
                if(child.name=='Head')
                {
                    Head=child;
                }
            model.traverse(function (child) 
            {
                if (child.isMesh) 
                {
                    child.castShadow = true;
                }
                });
            });
            //model.rotation.y=Math.PI;
            mixer = new AnimationMixer(model);
            fbxLoader = new FBXLoader();
            fbxLoader.load('./animations/sitting.fbx', function (animation1) 
            {
                action[0]= mixer.clipAction(animation1.animations[0]); 
                action[0].play();
        }); 
        }); 
        loader.load('./models/soundbox.glb', function (gltf) {
            model2 = gltf.scene;
            scene.add(model2);
           
        });
                
}
function onMouseMove(event) {
    // Calculate mouse position relative to the viewport
    /*var mouse = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1
    };*/

    mouseX = ( event.clientX - windowHalfX ) / 100;
	mouseY = ( event.clientY - windowHalfY ) / 100;
}
function createSpotlight( color ) {

    const newObj = new THREE.SpotLight( color, 100 );

    newObj.castShadow = true;
    newObj.angle = Math.PI/3;
    newObj.penumbra = 0.5;
    newObj.decay = 5;
    newObj.distance = 100;

    return newObj;

}
function tween( light ) {

    new TWEEN.Tween( light ).to( {
        angle: ( Math.random() * 0.7 ) + 0.1,
        penumbra: Math.random() + 1
    }, Math.random() * 3000 + 2000 )
        .easing( TWEEN.Easing.Quadratic.Out ).start();

    new TWEEN.Tween( light.position ).to( {
        x: ( Math.random() * 3 ) - 1.5,
        y: ( Math.random() * 1 ) + 1.5,
        z: ( Math.random() * 3 ) - 1.5
    }, Math.random() * 3000 + 2000 )
        .easing( TWEEN.Easing.Quadratic.Out ).start();

        

}

function animate() {
    //requestAnimationFrame(animate);
    tween( spotLight1 );
    tween( spotLight2 );
    tween( spotLight3 );

    setTimeout( animate, 2000 );

    

}


function render() 
{
    TWEEN.update();
    if (mixer) {
        var delta = clock.getDelta();
        mixer.update(delta); // Update the mixer
    }
    requestAnimationFrame(render);
    const distance = camera.position.distanceTo(orbit.target);
    renderer.render(scene, camera);
    orbit.autoRotate=true;
    orbit.update(0.05);
    
}
init();
document.addEventListener('mousemove', onMouseMove, false);

render();
animate();