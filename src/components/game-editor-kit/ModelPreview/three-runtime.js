const THREE_URL = 'https://esm.sh/three@r128'
const GLTF_LOADER_URL = 'https://esm.sh/three@r128/examples/jsm/loaders/GLTFLoader.js'

export const three = { THREE: undefined, GLTFLoader: undefined }
let threeLoading

export function loadThree() {
  threeLoading ||= Promise.all([import(THREE_URL), import(GLTF_LOADER_URL)]).then(([module, gltf]) => {
    three.THREE = module
    three.GLTFLoader = gltf.GLTFLoader
  })
  return threeLoading
}
