import * as THREE from './imports/js/three.module.js';
import { PointerLockControls } from './imports/js/PointerLockControls.js';
import { FBXLoader } from './imports/js/FBXLoader.js';
import { GLTFLoader } from './imports/js/GLTFLoader.js';


let model,model2, controls, mixer,moveAction,idleAction,gunAction2,mixer2;
const clock = new THREE.Clock();
let isJumping = false;
let keys = {};
let isRedLight = true;
let targetRotation = 90 
let isTurningBack = false;
let gameOver = false;
let isMoving = false;
let isMousemoving = false;

document.addEventListener('keydown', function (event) {
    keys[event.code] = true;
}, false);

document.addEventListener('keyup', function (event) {
    keys[event.code] = false;
}, false);


const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 45, 70000);

const manager = new THREE.LoadingManager();

manager.onStart = function (url, itemsLoaded, itemsTotal) {
    console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
};

manager.onLoad = function () {
    console.log('All resources loaded.');
    // Hide your loading screen here
    // Show your site here
};

manager.onProgress = function (url, itemsLoaded, itemsTotal) {
    console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
};

manager.onError = function (url) {
    console.log('There was an error loading ' + url);
};


const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

function createGround(scene) {
    var groundTexture = new THREE.TextureLoader().load( 'imports/textures/floor.jpg' );
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set( 50, 50 );
    groundTexture.anisotropy = 16;
    groundTexture.encoding = THREE.sRGBEncoding;

    var groundMaterial = new THREE.MeshPhongMaterial({color: 0xffffff, map: groundTexture});

    var groundGeometry = new THREE.PlaneGeometry( 11000, 11000 );

    var ground = new THREE.Mesh( groundGeometry, groundMaterial );
    ground.receiveShadow = true; // Set the ground to receive shadows
    ground.rotation.x = - Math.PI / 2; // rotate it to lie flat
    ground.position.set(0,0,0)

    scene.add( ground );
}

function addlight(scene) {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);
    const light2 = new THREE.DirectionalLight(0xffffff, 2);
    light2.position.set(2000, 4000, -10000);
    // Create an Object3D to serve as the target for the light
    const targetObject = new THREE.Object3D();
    targetObject.position.set(0, 0, -5000); // replace x, y, z with the coordinates you want the light to point to

    scene.add(targetObject); // add the target object to the scene

    light2.target = targetObject; // set the target of the light


    scene.add(light2);
    light2.castShadow = true;
    light2.shadow.mapSize.width = 4096; // default
    light2.shadow.mapSize.height = 4096; // default
    light2.shadow.camera.near = 10; // default
    light2.shadow.camera.far = 50000; // default
    light2.shadow.camera.left = 20000;
    light2.shadow.camera.right = -20000;
    light2.shadow.camera.top = 30000;
    light2.shadow.camera.bottom = -30000;
    
    
}

function createStartFinishLine(scene) {
    const finishLineTexture = new THREE.TextureLoader().load('imports/textures/finish.png'); // Replace with the path to your finish line texture
    const finishLineMaterial = new THREE.MeshBasicMaterial({ map: finishLineTexture });
    const finishLineGeometry = new THREE.BoxGeometry(20000, 10, 400); // Adjust these values to change the size of the finish line

    const finishLine = new THREE.Mesh(finishLineGeometry, finishLineMaterial);
    finishLine.position.set(0, 0, -1000); // Adjust these values to change the position of the finish line

    const startinglineTexture = new THREE.TextureLoader().load('imports/textures/finish.png'); // Replace with the path to your finish line texture
    const startinglineMaterial = new THREE.MeshBasicMaterial({ map: startinglineTexture });
    const startinglineGeometry = new THREE.BoxGeometry(20000, 10, 400); // Adjust these values to change the size of the finish line

    const startingline = new THREE.Mesh(startinglineGeometry, startinglineMaterial);
    startingline.position.set(0, 0, -13500); // Adjust these values to change the position of the finish line

    scene.add(startingline);
    scene.add(finishLine);
}


function create_sky(scene) {
    var skyGeo = new THREE.SphereGeometry(5000, 25, 25);
    var loader  = new THREE.TextureLoader();

    loader.load("imports/textures/sky.jpg", function(texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(5, 5); // Repeat the texture 10 times in both directions

        var skymaterial = new THREE.MeshPhongMaterial({ 
            map: texture,
        });
        skymaterial.side = THREE.BackSide; // Set the side property on skymaterial
        var sky = new THREE.Mesh(skyGeo, skymaterial);
        scene.add(sky);
    });
}

function createControls(camera, domElement) {
    controls = new PointerLockControls(camera, domElement);

    document.addEventListener('click', function () {
        controls.lock();
    }, false);
}



function loadModel(scene, camera, renderer) {
    const loader = new FBXLoader(manager);
    loader.load('imports/models/Beach.fbx', function (object) {
        model = object;
        const randomX = Math.random() * 15000 - 7500;
        model.position.set(randomX, 0, 0);
        camera.position.set(0, 170, 0); // Adjust the y value to match the model's height
        camera.rotation.y = Math.PI; // Adjust this value to rotate the camera

        if (model.animations && model.animations.length > 0) {
            mixer = new THREE.AnimationMixer(model);
            moveAction = mixer.clipAction(model.animations[1]); // runnning animation
            idleAction = mixer.clipAction(model.animations[20]); // idle animation
            
        }
        model.add(camera);
        scene.add(model);
        model.traverse(function (node) {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });
        animate(renderer, scene, camera);

    });
}

function loadModel2() {
    const loader = new FBXLoader(manager);
    loader.load('imports/models/Wizard.fbx', function (object) {
        model2 = object;
        model2.position.set(0, 0, -1000);

        const startingRotation = 90 * (Math.PI / 180); // Adjust this value to set the starting rotation (in radians)
        model2.rotation.y = startingRotation;

        const scaleFactor = 1; // Adjust this value to scale the model
        model2.scale.set(scaleFactor, scaleFactor, scaleFactor);
        
        if (model2.animations && model2.animations.length > 0) {
            mixer2 = new THREE.AnimationMixer(model2);
            gunAction2 = mixer2.clipAction(model2.animations[11]); // shooting 11     wizard 6 nao faz nada 11 feitico
        }

        scene.add(model2);
        model2.traverse(function (node) {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });
        toggleLight();
    });
}

function checkBoundaries(object, minX, maxX, minZ, maxZ) {
    if (object.x < minX) {
        object.x = minX;
    } else if (object.x > maxX) {
        object.x = maxX;
    }

    if (object.z < minZ) {
        object.z = minZ;
    } else if (object.z > maxZ) {
        object.z = maxZ;
    }
}

    
    function addModel(path, scaleFactor, positionX, positionZ, rotation, scene) {
        const loader = new GLTFLoader();
        loader.load(path, function (gltf) {
            const model = gltf.scene;
    
            // Set the model's position and scale here
            model.position.set(positionX, 0.5, positionZ);
            model.scale.set(scaleFactor, scaleFactor, scaleFactor);
            model.rotation.y = rotation; // Adjust this value to rotate the model
    
            scene.add(model);
            model.traverse(function (node) {
                if (node.isMesh) {
                    node.castShadow = true;
                    //node.receiveShadow = true;
                }
            })
        });
    }

function toggleLight() {
    if (!model2) return;

    if (isRedLight) {
        isRedLight = false;
        isTurningBack = true;
        targetRotation = 2 * Math.PI; 
    } else {
        targetRotation = Math.PI;
        // Add a delay before setting isRedLight to true
        setTimeout(() => {
            isRedLight = true;
        }, 500); // Adjust this value to change the delay
    }

    let time = isRedLight ? 3000 : Math.random() * (10000 - 2000) + 2000; 
    setTimeout(toggleLight, time);
}

/*document.addEventListener('keydown', function(event) {
    const key = event.key;
    if (isRedLight && document.pointerLockElement &&(key === "w" || key === "a" || key === "s" || key === "d")) {
        showLoseScreen();
    }
}, false);

document.addEventListener('mousemove', function(event) {
    if (isRedLight && document.pointerLockElement) {
        showLoseScreen();
    }
}, false);*/


window.addEventListener('keydown', function(event) {
    if (event.key === 'w' || event.key === 'a' || event.key === 's' || event.key === 'd' && document.pointerLockElement) {
        isMoving = true;
    }
});

window.addEventListener('keyup', function(event) {
    if (event.key === 'w' || event.key === 'a' || event.key === 's' || event.key === 'd' && document.pointerLockElement) {
        isMoving = false;
    }
});

window.addEventListener('mousemove', function() {
    if (isRedLight && document.pointerLockElement) {
        isMousemoving = true;
    }
    
});

window.addEventListener('mouseout', function() {
    isMousemoving = false;
});

window.addEventListener('redlightchange', function() {
    if (!isRedLight) {
        isMousemoving = false;
    }
});


function showLoseScreen() {
    setTimeout(function() {
        if (gameOver) return;
        gameOver = true;
        const messageDiv = document.getElementById('Screen');
        console.log("You lose!")
        messageDiv.textContent = "You lose!";
        messageDiv.style.display = "block";
        const rematchButton = document.getElementById('rematchButton');
        rematchButton.addEventListener('click', function() {
            window.location.reload();
        });
    }, 1200);
}
function showWinScreen() {
    if (gameOver) return;
    gameOver = true;
    console.log("You win!")
    const messageDiv = document.getElementById('Screen');
    messageDiv.textContent = "You win!";
    messageDiv.style.display = "block";
    const rematchButton = document.getElementById('rematchButton');
    rematchButton.addEventListener('click', function() {
        window.location.reload();
    });
}



function animate(renderer, scene, camera) {
    const speed = 1;
    let velocityY = 0;
    
    //checkBoundaries(model.position, -10000, 10000, -16000, 4000);
    // Calculate the forward and right vectors of the camera
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0));    

    if (gameOver) return;
    

    if (keys['KeyW']) {
        model.position.addScaledVector(forward, speed);
    }
    if (keys['KeyS']) {
        model.position.addScaledVector(forward, -speed);
    }
    if (keys['KeyA']) {
        model.position.addScaledVector(right, -speed);
    }
    if (keys['KeyD']) {
        model.position.addScaledVector(right, speed);
    }
    if (keys['Space'] && !isJumping) {
        isJumping = true;
        velocityY = 100;
    }

    if (model2 && Math.abs(model2.rotation.y - targetRotation) > 0.01) {
        model2.rotation.y += (targetRotation - model2.rotation.y) * 0.03; 
    } else if (isTurningBack) {
        isTurningBack = false;
    }
    
    if (model.position.z > -1000) { 
        //showWinScreen();
        
    }
    

    if (isJumping) {
        velocityY -= 3;
        model.position.y += velocityY;

        if (model.position.y <= 0) {
            model.position.y = 0;
            velocityY = 0;
            isJumping = false;
        }   
    }
    const delta = clock.getDelta();
    if (mixer) {
        if (isMoving) {
            if (!moveAction.isRunning()) {
                idleAction.stop();
                moveAction.play();
            }
        } else {
            if (!idleAction.isRunning()) {
                moveAction.stop();
                idleAction.play();
            }
        }}
        mixer.update(delta);


        if (mixer2) {
            if ((isMoving || isMousemoving)&& isRedLight) {
                if (!gunAction2.isRunning()) {
                    gunAction2.setLoop(THREE.LoopOnce); // Set the loop mode to once
                    gunAction2.clampWhenFinished = false; // Set clampWhenFinished to true to pause the animation on the last frame
                    gunAction2.play();
                }}}

            mixer2.update(delta);
        
        


        
        renderer.render(scene, camera);
    
        requestAnimationFrame(() => animate(renderer, scene, camera));
}


window.onload = function() {
    addlight(scene);
    createGround(scene);
    create_sky(scene);
    createStartFinishLine(scene);
    createControls(camera, renderer.domElement);
    //addModel('imports/models/Building.glb',1300, -8000, -1000, Math.PI/2, scene);
    
    //addRoad('imports/models/Billboard.glb',1800, 0, -6400, -Math.PI/2, scene);

    loadModel2();
    loadModel(scene, camera, renderer);
};

