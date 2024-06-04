import * as THREE from './imports/js/three.module.js';
import { PointerLockControls } from './imports/js/PointerLockControls.js';
import { FBXLoader } from './imports/js/FBXLoader.js';
import { GLTFLoader } from './imports/js/GLTFLoader.js';

let models = [];
let model,model2, controls, mixer,moveAction,idleAction,gunAction2,mixer2,spaceShuttle1,spaceShuttle2;
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
let launchShuttles = false;


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

    var radius = 40000; // radius of the circle
    var segments = 64; // number of segments (higher for more detail)
    var groundGeometry = new THREE.CircleGeometry(radius, segments);

    var ground = new THREE.Mesh( groundGeometry, groundMaterial );
    ground.receiveShadow = true; // Set the ground to receive shadows
    ground.rotation.x = - Math.PI / 2; // rotate it to lie flat
    ground.position.set(0,0,0)

    scene.add( ground );
}

function addlight(scene) {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    const light2 = new THREE.DirectionalLight(0xffffff, 2.9);
    light2.position.set(20000, 35000, -10000);
    
    // Create an Object3D to serve as the target for the light
    const targetObject = new THREE.Object3D();
    targetObject.position.set(0, 0, 5000); // replace x, y, z with the coordinates you want the light to point to
    const targetObject2 = new THREE.Object3D();
    targetObject2.position.set(20000, 20000, -10000)


    scene.add(targetObject); // add the target object to the scene
    scene.add(targetObject2);

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
    const finishLineGeometry = new THREE.BoxGeometry(75000, 10, 3000); // Adjust these values to change the size of the finish line

    const finishLine = new THREE.Mesh(finishLineGeometry, finishLineMaterial);
    finishLine.position.set(0, 0, -1000); // Adjust these values to change the position of the finish line

    const startinglineTexture = new THREE.TextureLoader().load('imports/textures/finish.png'); // Replace with the path to your finish line texture
    const startinglineMaterial = new THREE.MeshBasicMaterial({ map: startinglineTexture });
    const startinglineGeometry = new THREE.BoxGeometry(20000, 10, 400); // Adjust these values to change the size of the finish line

    const startingline = new THREE.Mesh(startinglineGeometry, startinglineMaterial);
    startingline.position.set(0, 0, -13500); // Adjust these values to change the position of the finish line

    //scene.add(startingline);
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
        model.position.set(randomX, 0, 35000);
        model.rotation.y = Math.PI;
        camera.position.set(0, 170, 0); 
        camera.rotation.y = Math.PI; 
        const scaleFactor = 4; // Adjust this value to scale the model
        model.scale.set(scaleFactor, scaleFactor, scaleFactor);

        if (model.animations && model.animations.length > 0) {
            mixer = new THREE.AnimationMixer(model);
            moveAction = mixer.clipAction(model.animations[1]); // running animation
            idleAction = mixer.clipAction(model.animations[20]); // idle animation
        }
        model.add(camera);
        scene.add(model);

        // Set bounding box after the model is added to the scene
        model.updateMatrixWorld(true);
        model.boundingBox = new THREE.Box3().setFromObject(model);
        

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

        const scaleFactor = 23; // Adjust this value to scale the model
        model2.scale.set(scaleFactor, scaleFactor, scaleFactor);

        if (model2.animations && model2.animations.length > 0) {
            mixer2 = new THREE.AnimationMixer(model2);
            gunAction2 = mixer2.clipAction(model2.animations[5]); // shooting 11 wizard 17 nao faz nada 11 feitico
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

function checkBoundaries(object, centerX, centerZ, radius) {
    const dx = object.position.x - centerX;
    const dz = object.position.z - centerZ;

    const distanceSquared = dx * dx + dz * dz;
    const radiusSquared = radius * radius;

    if (distanceSquared > radiusSquared) {
        const angle = Math.atan2(dz, dx);
        object.position.x = centerX + radius * Math.cos(angle);
        object.position.z = centerZ + radius * Math.sin(angle);
    }
}


    
function addModel(url, scale, x, y, z, rotation, scene, callback) {
    const loader = new GLTFLoader();

    loader.load(url, function(gltf) {
        const model = gltf.scene.children[0];
        model.scale.set(scale, scale, scale);
        model.position.set(x, y, z);
        model.rotation.y = rotation;
        scene.add(model);

        if (callback) {
            callback(model);
        }
    }, undefined, function(error) {
        console.error(error);
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
    document.getElementById('lightIndicator').style.backgroundColor = 'red';
    setTimeout(() => {
        isRedLight = true;
    }, 500);
    isTurningBack = true;
    targetRotation = 0; // 180 degrees for red light
} else {
    document.getElementById('lightIndicator').style.backgroundColor = 'green';
    isRedLight = false;
    isTurningBack = true;
    targetRotation = Math.PI; // 0 degrees for green light
}

    let time = isRedLight ? 2500 : Math.random() * 6000; 
    setTimeout(toggleLight, time);
}





function updateBoundingBoxes() {
    if (model) {
        model.boundingBox.setFromObject(model);
    }
    models.forEach((model) => {
        if (model.boundingBox) {
            model.updateMatrixWorld(true); // Ensure world matrices are up to date
            model.boundingBox.setFromObject(model);
        }
    });
}

function checkCollision(boundingBox) {
    for (let i = 0; i < models.length; i++) {
        if (models[i].boundingBox && boundingBox.intersectsBox(models[i].boundingBox)) {
            return true;
        }
    }
    return false;
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


// Show the start screen initially
document.getElementById('startScreen').style.display = 'block';

document.getElementById("startButton").addEventListener("click", function() {
    document.getElementById("background").style.backgroundColor = "transparent";
    document.getElementById('startScreen').style.display = 'none';
    gameStartTime = Date.now();
    // Lock the pointer and start the game
    controls.lock();
});

// Show the start screen initially
document.getElementById('startScreen').style.display = 'block';

document.getElementById("startButton").addEventListener("click", function() {
    setTimeout(() => {
            launchShuttles = true
    }, 3000);
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
                    setTimeout(showLoseScreen, 1000);
                
        }}, false);
            
            document.addEventListener('keydown', function(event) {
                const key = event.key;
                if (isRedLight && document.pointerLockElement && (key === "w" || key === "a" || key === "s" || key === "d")) {
                    setTimeout(showLoseScreen, 1000);
                }
            }, false);

            
        }
    }, 1000);
});



function showLoseScreen() {
    if (gameOver) return;
    gameOver = true;
    
    setTimeout(function() {
        const loseMessage = 'You lost! You moved during a red light!';
        document.getElementById('loseMessage').textContent = loseMessage;
        document.getElementById('loseScreen').style.display = 'block';
    }, 2000);

    document.getElementById('mainMenuButton').addEventListener('click', function() {
        location.reload();
    });
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

    // Calculate the forward and right vectors of the camera
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0));

    if (gameOver) return;

    // Store the original position
    const originalPosition = model.position.clone();

    // Create a flag to check if movement is allowed
    let canMoveForward = true;
    let canMoveBackward = true;
    let canMoveLeft = true;
    let canMoveRight = true;

    // Check potential collision positions
    if (keys['KeyW']) {
        model.position.addScaledVector(forward, speed);
        updateBoundingBoxes();
        if (checkCollision(model.boundingBox)) {
            canMoveForward = false;
        }
        model.position.copy(originalPosition);
    }
    if (keys['KeyS']) {
        model.position.addScaledVector(forward, -speed);
        updateBoundingBoxes();
        if (checkCollision(model.boundingBox)) {
            canMoveBackward = false;
        }
        model.position.copy(originalPosition);
    }
    if (keys['KeyA']) {
        model.position.addScaledVector(right, -speed);
        updateBoundingBoxes();
        if (checkCollision(model.boundingBox)) {
            canMoveLeft = false;
        }
        model.position.copy(originalPosition);
    }
    if (keys['KeyD']) {
        model.position.addScaledVector(right, speed);
        updateBoundingBoxes();
        if (checkCollision(model.boundingBox)) {
            canMoveRight = false;
        }
        model.position.copy(originalPosition);
    }

    // Update position if movement is allowed
    if (keys['KeyW'] && canMoveForward) {
        model.position.addScaledVector(forward, speed);
    }
    if (keys['KeyS'] && canMoveBackward) {
        model.position.addScaledVector(forward, -speed);
    }
    if (keys['KeyA'] && canMoveLeft) {
        model.position.addScaledVector(right, -speed);
    }
    if (keys['KeyD'] && canMoveRight) {
        model.position.addScaledVector(right, speed);
    }
    if (keys['Space'] && !isJumping) {
        isJumping = true;
        velocityY = 100;
    }

    if (model2 && isTurningBack) {
        const rotationSpeed = 0.05;
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
        showWinScreen();
    }

    if (launchShuttles) {
        if (spaceShuttle1 && spaceShuttle2) {
            spaceShuttle1.position.y += 30; // Replace with your actual space shuttle objects
            spaceShuttle2.position.y += 30; // Adjust the value to control the speed of the movement
        }
    }

    console.log(model.position.x, model.position.y, model.position.z)
    
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
        }
        mixer.update(delta);

        
    }
    checkBoundaries(model, 0, 0, 40000);
    renderer.render(scene, camera);
    requestAnimationFrame(() => animate(renderer, scene, camera));
}


window.onload = function() {
    addlight(scene);
    createGround(scene);
    create_sky(scene);
    createStartFinishLine(scene);
    createControls(camera, renderer.domElement);
    
    

    addSun('imports/models/Sun.glb', 8000, 20000, 35000, -10000, 0, 0xffff00,scene);

    addModel('imports/models/Space_Truck.glb', 2600, 10000,200 ,8000, 0, scene);
    addModel('imports/models/Space_Truck.glb', 3000, -10000,200 ,4000, Math.PI/2, scene);
    addModel('imports/models/Space_Truck.glb', 3000, -30000,200 ,-1000, Math.PI/2, scene);
    addModel('imports/models/Space_Truck.glb', 3000, 10000,200 ,20000, Math.PI/2, scene);

    addModel('imports/models/Space_shuttle.glb',350, 20000, 9000, 10000, 0, scene, function(model) {
        spaceShuttle1 = model;
    });

    addModel('imports/models/Space_shuttle.glb', 350, -20000, 9000, 10000, 0, scene, function(model) {
        spaceShuttle2 = model;
    });
    addModel('imports/models/landing_pad.glb',2350, 20000, 0, 9000, 0, scene);

    addModel('imports/models/landing_pad.glb', 2350, -20000, 0, 9000, 0, scene);


    addEarth('imports/models/Earth.glb', 350, 12000 , 20000, -30000, Math.PI / 2,scene);

    addModel('imports/models/StarFighter.glb', 6000, 10000,1200, 5000, Math.PI/2, scene);
    addModel('imports/models/Space_Station.glb', 3000, -13000,5000, 0, 0, scene,);    
    addModel('imports/models/asteroid.glb', 350, 10000, 16500, 10000, 0, scene);
    addModel('imports/models/asteroid.glb', 750, 12000, 8500, 20000, 0, scene);
    addModel('imports/models/asteroid.glb', 350, 1000, 22500, 10000, 0, scene);
    addModel('imports/models/asteroid.glb', 550, 10000, 28000, 10000, Math.PI, scene);
    addModel('imports/models/asteroid.glb', 450, -10000, 30000, -10000, 0, scene);
    addModel('imports/models/asteroid.glb', 150, -12000, 22000, -20000, Math.PI/2, scene);
    addModel('imports/models/asteroid.glb', 350, -1000, 11000, -10000, 0, scene);
    addModel('imports/models/asteroid.glb', 550, -10000, 30000, -10000, Math.PI, scene);
    addModel('imports/models/Flag.glb', 130, 3000, 0, 14000, 0, scene);
    addModel('imports/models/Billboard.glb', 15, 17000, 0, -14000, Math.PI/2, scene);
    addModel('imports/models/Billboard.glb', 15, -20000, 0, -14000, 3.5 * Math.PI/2, scene);
    addModel('imports/models/space_colony.glb', 6000, 2000, 0, -20000, 0, scene);

    addImage('imports/textures/solar_system.jpg',8750,3850,15550  ,7800 ,-13000,       0,0,0,scene);
    addImage('imports/textures/solar_system.jpg',8750,3850,-18300,7800 ,-13800,       0,0.33* Math.PI/2,0,scene);

    loadModel2();
    loadModel(scene, camera, renderer);
    
    
};

