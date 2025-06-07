export const componentNames =  ['Tarzan', 'Square2'];
// module.exports = {components: ['Tarzan', 'Square2']};
// const componentNames = ['Tarzan', 'Square2'];
// // ui-imports.ts
// // const componentNames = ['Tarzan', 'Jane', 'Cheetah'];

// async function loadComponents() {
//     const imports = await Promise.all(
//         componentNames.map(async (name) => {
//             const module = await import(`./illusions/${name}`);
//             return { [name]: module.default || module };
//         })
//     );

//     return Object.assign({}, ...imports);
// }

// export default loadComponents();




// // utils/common-imports.js
// export { default as Tarzan } from './components/Tarzan';
// export { default as Jane } from './components/Jane';
// export { default as Cheetah } from './components/Cheetah';
// // ... other 17 imports

// // page1.js, page2.js, etc.
// import { Tarzan, Jane, Cheetah /* ... */ } from '../utils/common-imports';