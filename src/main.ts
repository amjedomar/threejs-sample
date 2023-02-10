import * as THREE from 'three'
import './style.css'
import * as dat from 'dat.gui'
import { PlaneGeometry } from 'three'

const gui = new dat.GUI()

const world = {
  plane: {
    width: 10,
    height: 10,
    widthSegments: 10,
    heightSegments: 10,
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

camera.position.z = 5

const planeGeometry = new THREE.PlaneGeometry(5, 5, 10, 10)

const planeMaterial = new THREE.MeshPhongMaterial({
  color: 0xff0000,
  side: THREE.DoubleSide,
  // @ts-ignore
  flatShading: THREE.FlatShading,
})

const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial)

scene.add(planeMesh)

const arr = (planeMesh.geometry.attributes.position as any).array as number[]

for (let i = 0; i < arr.length; i += 3) {
  arr[i + 2] += Math.random()
}

const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(0, 0, 1)
scene.add(light)

function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}

animate()
