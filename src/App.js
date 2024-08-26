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

let scene, camera, renderer,model,mixer,orbit,fbxLoader,Head;
let minY = 0;
let maxY = 100;
let action=[];
let mouseX = 0;
let mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
var previousMouseX = 0;
var previousMouseY = 0;
var clock = new THREE.Clock();
let hobbies=[];
let angle=0;
let atomPosition=new THREE.Vector3(0,0,0);
let text=[];

function init()
{
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75,  window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth,window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    document.body.appendChild(renderer.domElement);
    camera.fov=500;

    const light = new THREE.AmbientLight( 0xFFFFFF ); // soft white light
    const directionalLight1 = new THREE.DirectionalLight( 0xffffff, 5 );
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
    
    const geometry = new THREE.PlaneGeometry( 10, 10);
    const Material = new THREE.ShadowMaterial({ opacity: 1 });
    const plane = new THREE.Mesh(geometry, Material);
    plane.receiveShadow = true;
    plane.castShadow=false; 
    plane.position.y=-0.005
    plane.rotation.x=-Math.PI/2;
    scene.add(plane);

    var canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var context = canvas.getContext('2d');
    var gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#9310F9'); // Blue
    gradient.addColorStop(0.7, '#19daf7');
    //gradient.addColorStop(1, '#000000'); // Red
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    var gradientTexture = new THREE.CanvasTexture(canvas);
    scene.background = gradientTexture;

    const hdriTextureLoader = new RGBELoader().load('./models/colorful_studio_4k.hdr', texture => {
        
        const gen = new THREE.PMREMGenerator(renderer);
        const HDRI= gen.fromEquirectangular(texture).texture;
        scene.environment =HDRI ;
        scene.environmentIntensity=0.01;
        scene.environmentRotation=Math.PI/4;

        texture.dispose();
        gen.dispose();
        //gen2.dispose();
      });

    //orbit = new OrbitControls(camera, renderer.domElement);
    camera.position.set(0,2,1.7);
    camera.rotation.x=-0.5;
   // orbit.enableDamping=true;
    //orbit.dampingFactor=1;
    //orbit.update();
    //orbit.minAzimuthAngle = -1.39626 ; // Minimum polar angle (in radians)
    //orbit.maxAzimuthAngle = 1.39626 ;
    //orbit.enablePanning=false;
    //.minPolarAngle = -Math.PI/2 ; // Minimum polar angle (in radians)
    //orbit.maxPolarAngle = Math.PI/2 ;
    var loader = new GLTFLoader();
        loader.load('./models/avataar.glb', function (gltf) {
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
            mixer = new AnimationMixer(model);
            fbxLoader = new FBXLoader();
            fbxLoader.load('./animations/Falling To Landing.fbx', function (animation1) 
            {
                action[0]= mixer.clipAction(animation1.animations[0]); 
                //action[0].play();
                fbxLoader.load('./animations/Waving.fbx', function (animation2) 
                {
                     action[1]= mixer.clipAction(animation2.animations[0]);
                     action[0].clampWhenFinished=true;
                     action[0].loop=THREE.LoopOnce;
                     action[0].play();
                     /*action[0].addEventListener('start', function() {
                        // Start the crossfade after 2 seconds
                        setTimeout(function () {
                            // Crossfade from action[0] to action[1] over 1 second
                            action[0].crossFadeTo(action[1], 1, true);
                        }, 2000);
                    });*/
                     setTimeout(function () 
                     {
                        action[0].crossFadeTo(action[1], 1, true);
                     }, 500);
                     action[1].play();
            });
            

        }); 
        }); 
        loader.load('./models/burger.glb', function (gltf)
        {
            hobbies[0]=gltf.scene;
            hobbies[0].traverse(function (child) 
            {
                if (child.isMesh) 
                {
                    child.castShadow = true;
                }
            });
            scene.add(hobbies[0]);

        });
        loader.load('./models/guitar.glb', function (gltf)
        {
            hobbies[1]=gltf.scene;
            hobbies[1].traverse(function (child) 
            {
                if (child.isMesh) 
                {
                    child.castShadow = true;
                }
            });
            scene.add(hobbies[1]);

        });
        loader.load('./models/basketball.glb', function (gltf)
        {
            hobbies[2]=gltf.scene;
            hobbies[2].traverse(function (child) 
            {
                if (child.isMesh) 
                {
                    child.castShadow = true;
                }
            });
            scene.add(hobbies[2]);
        });
        loader.load('./models/hiking_backpack.glb', function (gltf)
        {
            hobbies[3]=gltf.scene;
            hobbies[3].traverse(function (child) 
            {
                if (child.isMesh) 
                {
                    child.castShadow = true;
                }
            });
            scene.add(hobbies[3]);
        });
        loader.load('./models/hi text.glb', function (gltf)
        {
            text[0]=gltf.scene;
            text[0].traverse(function (child) 
            {
                if (child.isMesh) 
                {
                    child.castShadow = true;
                }
            });
            scene.add(text[0]);
            text[0].position.set(-15,-1,0);
            text[0].rotation.y=Math.PI/3;
        });
        loader.load('./models/art text.glb', function (gltf)
        {
            text[1]=gltf.scene;
            text[1].traverse(function (child) 
            {
                if (child.isMesh) 
                {
                    child.castShadow = true;
                }
            });
            scene.add(text[1]);
            text[1].position.set(15,-1,-5);
            text[1].rotation.y=-Math.PI/3;
        });
        const directionalLight2 = new THREE.DirectionalLight( 0xffffff, 5 );
        directionalLight2.position.set(-4,2.5,0);
        directionalLight1.lookAt(15,-1,-5);
        scene.add(directionalLight2);

        
        
        
}
function orbitModels(objectsArray, angle) {
    var radius = 1; // Radius of orbit
    var tiltAngle = -Math.PI / 3; // Tilt angle (45 degrees) around the x-axis

    // Calculate angle step for distributing objects evenly
    var angleStep = (2 * Math.PI) / objectsArray.length;

    objectsArray.forEach(function(object, index) {
        // Calculate the angle for this object
        var orbitAngle = angle + index * angleStep;

        // Calculate the position of the object around the central character
        var x = atomPosition.x + radius * Math.cos(orbitAngle);
        var y = 1 + radius * Math.sin(orbitAngle) * Math.cos(tiltAngle);
        var z = atomPosition.z + radius * Math.sin(orbitAngle) * Math.sin(tiltAngle);

        // Set the position of the object
        object.position.set(x, y, z);

        object.rotation.y += 0.03;
	    //object.rotation.z += 0.02;
        //object.lookAt(camera.position);
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
function updateBoneRotation() {

    // Calculate rotation quaternion to look at the target position
    Head.matrixAutoUpdate=true;
    Head.matrixWorldNeedsUpdate=true;
    Head.matrixAutoUpdate=true;
    var lookAtQuaternion = new THREE.Quaternion();
    var position=camera.position;
    Head.lookAt(position);
    Head.getWorldQuaternion(lookAtQuaternion);
        var euler = new THREE.Euler().setFromQuaternion(lookAtQuaternion);

    // Clamp rotation angles within limits
    euler.x = THREE.MathUtils.clamp(euler.x, -Math.PI / 2, Math.PI / 2); // Top/bottom limit
    euler.y = THREE.MathUtils.clamp(euler.y, -Math.PI / 2, Math.PI / 2); // Left/right limit

    // Convert Euler angles back to quaternion
    lookAtQuaternion.setFromEuler(euler);
    Head.quaternion.copy(lookAtQuaternion);
    /*var parentBone = Head.parent;
    var scaleFactor =0.00005// Adjust this factor as needed

    while (parentBone) 
    {
        var scaledFinalQuaternion = lookAtQuaternion.clone().slerp(parentBone.quaternion, scaleFactor);

        // Apply the scaled rotation to the parent bone
        parentBone.quaternion.copy(scaledFinalQuaternion);

        // Move up to the next parent bone
        parentBone = parentBone.parent;
        if(parentBone.name=='Hips')
        {
            break;
        }
        
    }*/
}
function animateBobbing(object, speed, height) {
    // Get the current time
    const time = performance.now();

    // Calculate vertical displacement based on sine wave
    const displacement = Math.sin(time * speed) * height;

    // Set the object's position
    object.position.y = displacement;
}




function animate() 
{
    requestAnimationFrame(animate);

    if (mixer) {
        var delta = clock.getDelta();
        mixer.update(delta); // Update the mixer
    }
    updateBoneRotation();
    renderer.render(scene, camera);
    camera.position.x += ( mouseX - camera.position.x ) * .05;
    camera.position.y += ( - mouseY - camera.position.y ) * .05;
    
    camera.lookAt( 0,1,0 );

    var currentPosition = camera.position;
    currentPosition.y = Math.max(1, Math.min(maxY, currentPosition.y));
    currentPosition.x=  Math.max(-2, Math.min(2, currentPosition.x));
    if(mouseX > 0)
    angle -= 0.03;
    else
    angle += 0.03;
    orbitModels(hobbies,angle);
    animateBobbing(text[0],0.005,1);
    animateBobbing(text[1],0.005,1);
    // Update orbit controls
    //orbit.update();
    
}
init();
document.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('DOMContentLoaded', (event) => {
    // Get the audio element
    var audio = document.getElementById('music');
    var playButton = document.getElementById('playButton');

    // Add click event listener to the play button
    playButton.addEventListener('click', function() {
        // Play the audio
        audio.play();
    });
});
animate();