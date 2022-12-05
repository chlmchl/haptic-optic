// Step 1
const draggable = interact('.draggable')    // target elements with the "draggable" class

draggable
  // Step 2
  .draggable({                        // make the element fire drag events
    origin: 'self',                   // (0, 0) will be the element's top-left
    inertia: true,                    // start inertial movement if thrown
    modifiers: [
      interact.modifiers.restrict({
        restriction: 'self'           // keep the drag coords within the element
      })
    ],
    // Step 3
    listeners: {
      move (event) {                  // call this listener on every dragmove
        const draggableWidth = interact.getElementRect(event.target).width
        const value = event.pageX / draggableWidth

        event.target.style.paddingLeft = (value * 50) + '%'
        event.target.setAttribute('data-value', value.toFixed(1))
      }
    }
  })