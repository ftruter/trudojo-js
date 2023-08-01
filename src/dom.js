/**
 * Find a single element matching the given selector, optionally within the given container.
 * @param {str} selector any CSS selector can be used here, `#id`, `.class`, `[attr]`, `[attr=value]`, etc.
 * @param {Element} container any DOM element to search within, defaults to entire document
 * @returns the element, or null if not found
 */
export const $find = (selector, container = document) => 
  container.querySelector(selector)

/**
 * Find all elements matching the given selector, optionally within the given container.
 * @param {str} selector any CSS selector can be used here, `tag` `.class`, `[attr]`, `[attr=value]`, etc.
 * @param {Element} container any DOM element to search within, defaults to entire document
 * @returns an array of elements, which may be empty
 * @see $ for a version that returns a single element
 */
export const $findAll = (selectors, container = document) => 
  Array.from(container.querySelectorAll(selectors))

/**
 * Construct a new element with the given tag name, attributes, styles, and events.
 * @param {string} tagName lowercase tag name, e.g. 'div'
 * @param {object} attributes optional map of attribute names to values. If values are functions, they are called and the result is used as the value.
 * @param {object} styles optional map of style names to values. If values are functions, they are called and the result is used as the value. This can be included in attributes instead of as a separate argument.
 * @param {object} events optional map of event names to handlers. This can be included in attributes instead of as a separate argument.
 * @param {Element} container optional container element to append the new element to
 * @param {[Element]} chilren optional list of child elements to append to the new element
 * @returns the new element
 */
export const $new = (tagName, attributes, styles, events, container, children) => {
  const elem = document.createElement(tagName)
  if (!children && attributes?.children) {
    children = attributes.children
    delete attributes.children
  }
  if (!container && attributes?.container) {
    container = attributes.container
    delete attributes.container
  }
  if (!events && attributes?.events) {
    events = attributes.events
    delete attributes.events
  }
  if (!styles && attributes?.styles) {
    styles = attributes.styles
    delete attributes.styles
  }
  if (attributes) 
    for (const key in attributes) {
      const value = attributes[key]
      if (value instanceof Function)
        value = value(elem)
      elem.setAttribute(key, value)
    }
  if (styles)
    for (const key in styles) {
      const value = styles[key]
      if (value instanceof Function)
        value = value(elem)
      elem.style[key] = value
    }

  if (events)
    for (const key in events)
      elem.addEventListener(key, events[key])

  if (children) 
    for (const child of children)
      elem.appendChild(child)

  if (container)
    container.appendChild(elem)

  return elem
}

// Convenience methods for Element
Object.defineProperties(Element.prototype, {
  /**
   * Find a single element matching the given selector within this element.
   */
  $: {
    value: function (selector) {
      return this.querySelector(selector)
    }
  },

  /**
   * Find all elements matching the given selector within this element.
   */
  $$: {
    value: function (selectors) {
      return Array.from(this.querySelectorAll(selectors))
    }
  },

  /**
   * Construct a new element with the given tag name, attributes, styles, and events, and append it to this element.
   * @param {string|Element|[Element]} tagName lowercase tag name, e.g. 'div' or a pre-made element or list of elements
   * @param {object} attributes optional map of attribute names to values. If values are functions, they are called and the result is used as the value.
   * @param {object} styles optional map of style names to values. If values are functions, they are called and the result is used as the value. This can be included in attributes instead of as a separate argument.
   * @param {object} events optional map of event names to handlers. This can be included in attributes instead of as a separate argument.
   * @param {[Element]} chilren optional list of child elements to append to the new element
   * @returns this element to allow chaining
   */
  $append: {
    value: function (tagName, attributes, styles, events, children) {
      $new(tagName, attributes, styles, events, this, children)
      return this
    }
  },

  /**
   * Construct a new element with the given tag name, attributes, styles, and events, and prepend it to this element.
   * @param {string|Element|[Element]} tagName lowercase tag name, e.g. 'div' or a pre-made element or list of elements
   * @param {object} attributes optional map of attribute names to values. If values are functions, they are called and the result is used as the value.
   * @param {object} styles optional map of style names to values. If values are functions, they are called and the result is used as the value. This can be included in attributes instead of as a separate argument.
   * @param {object} events optional map of event names to handlers. This can be included in attributes instead of as a separate argument.
   * @param {[Element]} chilren optional list of child elements to append to the new element
   * @returns this element to allow chaining
   */
  $prepend: {
    value: function (tagName, attributes, styles, events, children) {
      const elem = $new(tagName, attributes, styles, events, null, children)
      this.insertBefore(elem, this.firstChild)
      return this
    }
  },

  /**
   * Change an attribute value or retrieve it if no value is given.
   * @param {string} name attribute name
   * @param {any} value optional new value. If the value is a function, it is called and the result is used as the value.
   * @returns this element to allow chaining when a new value was given, or the previous value if the new value was omitted
   */
  $attr: {
    value: function (name, value) {
      if (value === undefined)
        return this.getAttribute(name)
      if (value instanceof Function)
        value = value(this)
      this.setAttribute(name, value)
      return this
    }
  },

  /**
   * Change a class value or retrieve it if no value is given.
   * @param {string} name class name
   * @param {boolean|'toggle'|Function} value optional new value. If the value is a function, it is called and the result is used as the value. If the value is 'toggle', the class is toggled.
   * @returns this element to allow chaining when a new value was given, or the previous value if the new value was omitted
   */
  $class: { 
    value: function (name, value) {
      if (value === undefined)
        return this.classList.contains(name)
      if (value instanceof Function)
        value = value(this)
      if (value === 'toggle')
        this.classList.toggle(name, value)
      else if (value)
        this.classList.add(name)
      else
        this.classList.remove(name)
      return this
    }
  },

  /**
   * Change a style value or retrieve it if no value is given.
   * @param {string} name style name
   * @param {any} value optional new value. If the value is a function, it is called and the result is used as the value.
   * @returns this element to allow chaining when a new value was given, or the previous value if the new value was omitted
   */
  $style: {
    value: function (name, value) {
      if (value === undefined)
        return this.style[name]
      if (value instanceof Function)
        value = value(this)
      this.style[name] = value
      return this
    }
  },

  /**
   * Attach an event listener.
   * @param {string} name event name, e.g. `click`
   * @param {Function} handler event handler
   * @returns this element to allow chaining
   */
  $on: {
    value: function (name, handler) {
      this.addEventListener(name, handler)
      return this
    }
  }
})
