import * as THREE from './imports/js/three.module.js';
import { PointerLockControls } from './imports/js/PointerLockControls.js';
import { FBXLoader } from './imports/js/FBXLoader.js';
import { GLTFLoader } from './imports/js/GLTFLoader.js';

let models = [];
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
let gameStartTime = null;


document.addEventListener('keydown', function (event) {
    keys[event.code] = true;
}, false);

document.addEventListener('keyup', function (event) {
    keys[event.code] = false;
}, false);


const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 45, 70000);

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

    var groundGeometry = new THREE.PlaneGeometry( 70000, 70000 );

    var ground = new THREE.Mesh( groundGeometry, groundMaterial );
    ground.receiveShadow = true; // Set the ground to receive shadows
    ground.rotation.x = - Math.PI / 2; // rotate it to lie flat
    ground.position.set(0,0,0)

    scene.add( ground );
}

function addlight(scene) {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    const light2 = new THREE.DirectionalLight(0xffffff, 1.9);
    light2.position.set(20000, 20000, -10000);
    const light3 = new THREE.DirectionalLight(0xffffff, 5);
    light3.position.set(-20000, 10000, -10000);
    // Create an Object3D to serve as the target for the light
    const targetObject = new THREE.Object3D();
    targetObject.position.set(0, 0, 5000); // replace x, y, z with the coordinates you want the light to point to
    const targetObject2 = new THREE.Object3D();
    targetObject2.position.set(20000, 20000, -10000)


    scene.add(targetObject); // add the target object to the scene
    scene.add(targetObject2);

    light2.target = targetObject; // set the target of the light
    light3.target = targetObject2;

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
    var skyGeo = new THREE.SphereGeometry(40000, 25, 25);
    var loader  = new THREE.TextureLoader();

    loader.load("imports/textures/sky.jpg", function(texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(5, 5); 

        var skymaterial = new THREE.MeshPhongMaterial({ 
            map: texture,
        });
        skymaterial.side = THREE.BackSide; 
        var sky = new THREE.Mesh(skyGeo, skymaterial)
        sky.position.set(0, 0, 0);
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
    const loader = new FBXLoader();
    loader.load('imports/models/Beach.fbx', function (object) {
        model = object;
        const randomX = Math.random() * 15000 - 7500;
        model.position.set(randomX, 0, 15000);
        model.rotation.y = 0;
        camera.position.set(0, 170, 0); 
        camera.rotation.y = 0; 

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
    const loader = new FBXLoader();
    loader.load('imports/models/astro_frog.fbx', function (loadedModel2) {
        model2 = loadedModel2;
        model2.position.set(0, 0, -1000);

        const startingRotation = -Math.PI / 2; // Start facing red light
        model2.rotation.y = startingRotation;

        const scaleFactor = 18; // Adjust this value to scale the model
        model2.scale.set(scaleFactor, scaleFactor, scaleFactor);

        console.log(model2.animations);
        if (model2.animations && model2.animations.length > 0) {
            mixer2 = new THREE.AnimationMixer(model2);
            gunAction2 = mixer2.clipAction(model2.animations[11]); // shooting 11 wizard 6 nao faz nada 11 feitico
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

    
function addModel(path, scaleFactor, positionX,positionY, positionZ, rotation, scene) {
    const loader = new GLTFLoader();
    loader.load(path, function (gltf) {
        const model = gltf.scene;

        // Set the model's position and scale here
        model.position.set(positionX, positionY, positionZ);
        model.scale.set(scaleFactor, scaleFactor, scaleFactor);
        model.rotation.y = rotation; // Adjust this value to rotate the model

        scene.add(model);
        models.push(model);
        model.traverse(function (node) {
            if (node.isMesh) {
                node.castShadow = true;
                //node.receiveShadow = true;
            }
        })
    });
}

function addSun(path, scaleFactor, positionX,positionY, positionZ, rotation, color, scene) {
    const loader = new GLTFLoader();
    loader.load(path, function (gltf) {
        const model = gltf.scene;

        // Set the model's position and scale here
        model.position.set(positionX, positionY, positionZ);
        model.scale.set(scaleFactor, scaleFactor, scaleFactor);
        model.rotation.y = rotation; // Adjust this value to rotate the model
        model.traverse(function (node) { 
            if (node.isMesh) {
                node.material = new THREE.MeshBasicMaterial({color: color, side: THREE.DoubleSide});
            }
        });
        scene.add(model);
        models.push(model);
        
        
    });
}

function addEarth(path, scaleFactor, positionX,positionY, positionZ, rotation, scene) {
    const loader = new GLTFLoader();
    loader.load(path, function (gltf) {
        const model = gltf.scene;

        // Set the model's position and scale here
        model.position.set(positionX, positionY, positionZ);
        model.scale.set(scaleFactor, scaleFactor, scaleFactor);
        model.rotation.y = rotation; // Adjust this value to rotate the model
        
        scene.add(model);
        models.push(model);
        
        
    });
}

function addImage(path,width,height,posx,posy,posz,rotationx,rotationy,rotationz,scene) {
    var loader = new THREE.TextureLoader();
    var material = new THREE.MeshBasicMaterial({
    map: loader.load(path)
    });
    var geometry = new THREE.PlaneGeometry(width, height);
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(posx,posy,posz)
    mesh.rotation.z = rotationz
    mesh.rotation.y = rotationy
    mesh.rotation.x = rotationx
    
    scene.add(mesh);
}

function toggleLight() {
    if (!model2) {
        console.log("Model not loaded");
        return;
    }

    if (!isRedLight) {
        console.log("Red light!");
        setTimeout(() => {
            isRedLight = true;
        }, 500);
        isTurningBack = true;
        targetRotation = 0; // 180 degrees for red light
    } else {
        console.log("Green light!");
        isRedLight = false;
        isTurningBack = true;
        targetRotation = Math.PI; // 0 degrees for green light
    }

    let time = isRedLight ? 3000 : Math.random() * (10000 - 2000) + 2000; 
    setTimeout(toggleLight, time);
}




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

document.getElementById("startButton").addEventListener("click", function() {
    document.getElementById("background").style.backgroundColor = "transparent";
    document.getElementById('startScreen').style.display = 'none';
    gameStartTime = Date.now();
    // Lock the pointer and start the game
    controls.lock();
});


// Show the start screen initially
document.getElementById('startScreen').style.display = 'block';

let canMove = false; // Variable to track whether movement is allowed

document.getElementById("startButton").addEventListener("click", function() {
    document.getElementById("background").style.backgroundColor = "transparent";
    document.getElementById('startScreen').style.display = 'none';
    gameStartTime = Date.now();
    // Lock the pointer and start the game
    controls.lock();
});

// Show the start screen initially
document.getElementById('startScreen').style.display = 'block';
/*
document.getElementById("startButton").addEventListener("click", function() {
    let countdownElement = document.getElementById('countdown');
    let countdownValue = 3;
    countdownElement.textContent = countdownValue;

    let countdownInterval = setInterval(() => {
        countdownValue--;
        if (countdownValue > 0) {
            countdownElement.textContent = countdownValue;
        } else {
            clearInterval(countdownInterval);
            countdownElement.textContent = '';
            gameStartTime = Date.now();
            isRedLight = true; // Set light to red
            targetRotation = 0; // Set rotation for red light
            console.log("Start");
            console.log(gameStartTime);
            document.addEventListener('mousemove', function(event) {
                if (isRedLight && document.pointerLockElement) {
                    showLoseScreen();
                }
            }, false);
            document.addEventListener('keydown', function(event) {
                const key = event.key;
                if (isRedLight && document.pointerLockElement && (key === "w" || key === "a" || key === "s" || key === "d")) {
                    showLoseScreen();
                }
            }, false);

            // Enable movement after 3 seconds
            setTimeout(() => {
                canMove = true;
            }, 3000);
        }
    }, 1000);
});
*/


function showLoseScreen() {
    if (gameOver) return;
    gameOver = true;
    setTimeout(function() {
        const messageDiv = document.getElementById('Screen');
        const rematchButton = document.getElementById('rematchButton');
        messageDiv.textContent = "You lost!";
        messageDiv.style.display = "block";
        rematchButton.style.display = "block";
 
        ;
    }, 1200);
}

function showWinScreen() {
    if (gameOver) return;
    gameOver = true;
    const elapsedTime = (Date.now() - gameStartTime) / 1000; // Calculate elapsed time in seconds
    const winMessage = `You won! Elapsed time: ${elapsedTime.toFixed(2)} seconds`;

    document.getElementById('winMessage').textContent = winMessage;
    document.getElementById('winScreen').style.display = 'block';

    document.getElementById('mainMenuButton').addEventListener('click', function() {
        location.reload();
    });
}



function animate(renderer, scene, camera) {
    const speed = 200;
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

    /*if (model2 && Math.abs(model2.rotation.y - targetRotation) > 0.01) {
        model2.rotation.y += (targetRotation - model2.rotation.y) * 0.1; 
    } else if (isTurningBack) {
        isTurningBack = false;
    }*/

    if (model2 && isTurningBack) {
        const rotationSpeed = 0.05; // Adjust this value to change the rotation speed
        const currentRotation = model2.rotation.y;
        const rotationDifference = targetRotation - currentRotation;

        if (Math.abs(rotationDifference) > 0.01) {
            model2.rotation.y += rotationDifference * rotationSpeed;
        } else {
            model2.rotation.y = targetRotation;
            isTurningBack = false;
        }
    }
    
    if (model.position.z < -1000) { 
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

        /*if (mixer2) {
            if ((isMoving || isMousemoving)&& isRedLight) {
                if (!gunAction2.isRunning()) {
                    gunAction2.setLoop(THREE.LoopOnce); // Set the loop mode to once
                    gunAction2.clampWhenFinished = false; // Set clampWhenFinished to true to pause the animation on the last frame
                    gunAction2.play();
                }}}

            mixer2.update(delta);*/
    

        /*const modelBox = new THREE.Box3().setFromObject(model);

        // Assuming `models` is an array containing all other models
        models.forEach((otherModel) => {
            const otherModelBox = new THREE.Box3().setFromObject(otherModel);
            
            if (modelBox.intersectsBox(otherModelBox)) {
                console.log('Collision detected!');
                // Handle collision (e.g., stop movement, end game, etc.)
            }
        });*/

        
        renderer.render(scene, camera);
    
        requestAnimationFrame(() => animate(renderer, scene, camera));
}


window.onload = function() {
    addlight(scene);
    createGround(scene);
    create_sky(scene);
    createStartFinishLine(scene);
    createControls(camera, renderer.domElement);
    

    addSun('imports/models/Sun.glb', 6000, 20000, 20000, -10000, 0, 0xffff00,scene);

    addModel('imports/models/Space_Truck.glb', 1200, 4000,170 ,8000, 0, scene);
    addModel('imports/models/Space_Truck.glb', 1400, -2000,170 ,4000, Math.PI/2, scene);

    addModel('imports/models/Space_shuttle.glb', 100, 10000, 2100, 10000, 0, scene);

    addEarth('imports/models/Earth.glb', 200, 0 , 9000, -20000, Math.PI / 2,scene);

    addModel('imports/models/StarFighter.glb', 3000, 10000,600, -1000, Math.PI/2, scene);

    addModel('imports/models/Space_Station.glb', 2000, 5000,15000, -17000, 0, scene);
    
    addModel('imports/models/asteroid.glb', 300, 10000, 10000, 10000, 0, scene);
    addModel('imports/models/asteroid.glb', 700, 12000, 5000, 20000, 0, scene);
    addModel('imports/models/asteroid.glb', 300, 1000, 20000, 10000, 0, scene);
    addModel('imports/models/asteroid.glb', 500, 10000, 20000, 10000, 0, scene);
    addModel('imports/models/asteroid.glb', 400, -10000, 10000, -10000, 0, scene);
    addModel('imports/models/asteroid.glb', 100, -12000, 5000, -20000, 0, scene);
    addModel('imports/models/asteroid.glb', 300, -1000, 10000, -10000, 0, scene);
    addModel('imports/models/asteroid.glb', 500, -10000, 20000, -10000, 0, scene);

    addModel('imports/models/Flag.glb', 130, 3000, 0, 14000, 0, scene);

    addModel('imports/models/Billboard.glb', 9, 6000, 0, -4000, Math.PI/2, scene);
    addModel('imports/models/Billboard.glb', 9, -10000, 0, -4000, 3.5 * Math.PI/2, scene);

    addImage('imports/textures/solar_system.jpg',2000,2000,5400,4800,-3500,0,0,0,scene);
    addImage('imports/textures/solar_system.jpg',5350,2050,-9000,4800,-4000,0,0.33* Math.PI/2,0,scene);

    loadModel2();
    loadModel(scene, camera, renderer);
};

