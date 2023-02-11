import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import './style.css'
import * as dat from 'dat.gui'
import { PlaneGeometry } from 'three'

const gui = new dat.GUI()

const world = {
  plane: {
    width: 20,
    height: 20,
    widthSegments: 50,
    heightSegments: 50,
  },
}

gui.add(world.plane, 'width', 1, 20).onChange(generatePlane)
gui.add(world.plane, 'height', 1, 20).onChange(generatePlane)
gui.add(world.plane, 'widthSegments', 1, 50).onChange(generatePlane)
gui.add(world.plane, 'heightSegments', 1, 50).onChange(generatePlane)

function generatePlane() {
  planeMesh.geometry.dispose()

  planeMesh.geometry = new PlaneGeometry(
    world.plane.width,
    world.plane.height,
    world.plane.widthSegments,
    world.plane.heightSegments
  )

  const arr = (planeMesh.geometry.attributes.position as any).array as number[]

  for (let i = 0; i < arr.length; i += 3) {
    arr[i + 2] += Math.random()
  }
}

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  0.1,
  1000
)

const renderer = new THREE.WebGLRenderer()

renderer.setSize(innerWidth, innerHeight)
renderer.setPixelRatio(devicePixelRatio)
document.body.appendChild(renderer.domElement)
new OrbitControls(camera, renderer.domElement)

camera.position.z = 5

const planeGeometry = new THREE.PlaneGeometry(
  world.plane.width,
  world.plane.height,
  world.plane.widthSegments,
  world.plane.heightSegments
)

const planeMaterial = new THREE.MeshPhongMaterial({
  side: THREE.DoubleSide,
  // @ts-ignore
  flatShading: THREE.FlatShading,
  vertexColors: true,
})

const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial)

const raycaster = new THREE.Raycaster()

scene.add(planeMesh)

const planeMeshPos = planeMesh.geometry.attributes.position as any
const arr = planeMeshPos.array as number[]

for (let i = 0; i < arr.length; i += 3) {
  arr[i + 2] += Math.random()
}

const colors = []

for (let i = 0; i < planeMeshPos.count; i++) {
  colors.push(1, 0, 0)
}

planeMesh.geometry.setAttribute(
  'color',
  new THREE.BufferAttribute(new Float32Array(colors), 3)
)

const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(0, 0, 1)
scene.add(light)

const backLight = new THREE.DirectionalLight(0xffffff, 1)
backLight.position.set(0, 0, -1)
scene.add(backLight)

const mouse = {
  x: undefined,
  y: undefined,
} as any

function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)

  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObject(planeMesh)
  if (intersects.length > 0) {
    const object = intersects[0].object as any
    const geometry = object.geometry
    const face = intersects[0].face!
    const { color } = geometry.attributes

    // vertex 1
    color.setX(face.a, 0)
    color.setY(face.a, 0)
    color.setZ(face.a, 1)

    // vertex 2
    color.setX(face.b, 0)
    color.setY(face.b, 0)
    color.setZ(face.b, 1)

    // vertex 3
    color.setX(face.c, 0)
    color.setY(face.c, 0)
    color.setZ(face.c, 1)

    color.needsUpdate = true
  }
}

animate()

window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / innerWidth) * 2 - 1
  mouse.y = -(event.clientY / innerHeight) * 2 + 1
})
