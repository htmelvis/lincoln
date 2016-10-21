//initialize style for lincoln
import '../style/plugins/navigation.styl';

const Lincoln = (($) => {
  const NAME = 'lincoln';
  const JQUERY_NO_CONFLICT = $.fn[NAME];
  const DATA_KEY = 'lincoln.navigator';
  const DATA_API_KEY = '.data-api';
  const EVENT_KEY = `.${DATA_KEY}`;
  const ESCAPE_KEYCODE = 27;
  const ARROW_RIGHT_KEYCODE = 39;
  const ARROW_LEFT_KEYCODE = 37;
  const ARROW_UP_KEYCODE = 38;
  const ARROW_DOWN_KEYCODE = 40;

  const Event = {
    HIDE:     `hide${EVENT_KEY}`,
    HIDDEN:   `hidden${EVENT_KEY}`,
    SHOW:     `show${EVENT_KEY}`,
    SHOWN:    `shown${EVENT_KEY}`,
    CLICK:    `click${EVENT_KEY}`,
    KEYPRESS: `keydown${EVENT_KEY}`,
    CLICK_DATA_API   : `click${EVENT_KEY}${DATA_API_KEY}`,
    KEYDOWN_DATA_API : `keydown${EVENT_KEY}${DATA_API_KEY}`
  };

  const ClassName = {
    OPEN: 'show-nav',
    TRANS: 'snappy',
    BACKDROP: 'open-nav-backdrop',
  };

  const Selector = {
    BACKDROP:     '.open-nav-backdrop',
    MENUTRIGGER:  '.menu-trigger',
    WINDOWWRAP:   '#site-wrapper',
    MENU:         '#site-menu',
    VISIBLE_ITEMS:'.navigation-items',
    SEARCH_BAR: '.nav-search'
  };

  class Lincoln {
    constructor (elem, config) {
      this.element = elem;
      this._addEventListeners();
    }

    //public methods

    toggle() {
      console.log(this);
      let parent   = Lincoln._getParentFromElement(this)
      let isActive = $(Selector.WINDOWWRAP).hasClass(ClassName.OPEN);
      Lincoln._clearMenu();

      if(isActive) return false;

      //Add Transition Class for Style
      $('#site-canvas').addClass(ClassName.TRANS);

      // touch enhancement
      if('ontouchstart' in document.documentElement) {
        // if mobile we use a backdrop in order to delegate events
        let windowCover = document.createElement('div');
        windowCover.className = ClassName.BACKDROP;
        $(windowCover).insertBefore(this);
        $(windowCover).on('click', Lincoln._clearMenu);

      }

      let relatedTarget = { relatedTarget : this };
      let showEvent = $.Event(Event.SHOW, relatedTarget);

      $(Selector.WINDOWWRAP).trigger(showEvent);

      if(showEvent.isDefaultPrevented()){
        return false;
      }

      this.focus();
      this.setAttribute('aria-expanded', 'true');

      $(Selector.WINDOWWRAP).toggleClass(ClassName.OPEN);
      $(Selector.WINDOWWRAP).trigger($.Event(Event.SHOWN, relatedTarget));

      return false;
    }

    dispose(){
      $.removeData(this._element, DATA_KEY);
      $(this.element).off(EVENT_KEY);
      this._element = null;
    }

    //private methods
    _addEventListeners() {
      $(this._element).on(Event.CLICK, this.toggle);
    }

    // static methods
    static _jQueryInterface(config) {
      return this.each(function () {
        let data  = $(this).data(DATA_KEY);

        if (!data) {
          $(this).data(DATA_KEY, (data = new Lincoln(this)));
        }

        if (typeof config === 'string') {
          if (data[config] === undefined) {
            throw new Error(`No method named "${config}"`);
          }
          data[config].call(this);
        }
      })
    }



    static _clearMenu(event) {

      let backdrop = $(Selector.BACKDROP)[0];
      if (backdrop) {
        backdrop.parentNode.removeChild(backdrop);
      }

      let toggles = $.makeArray($(Selector.MENUTRIGGER));

      for (let i = 0; i < toggles.length; i++) {
        // TODO: Work on this in order to make parent WINDOWWRAP
        let parent = Lincoln._getParentFromElement(toggles[i]);
        let relatedTarget = {
          relatedTarget : toggles[i]
        }

        if (!$(parent).hasClass(ClassName.OPEN)) {
          continue;
        }

        if (event && event.type === 'click' &&
           (/input|textarea/i.test(event.target.tagName)) &&
           ($.contains(parent, event.target))) {
          continue;
        }

        let hideEvent = $.Event(Event.HIDE, relatedTarget);

        $(parent).trigger(hideEvent)
        if (hideEvent.isDefaultPrevented()) {
          continue;
        }

        toggles[i].setAttribute('aria-expanded', 'false')

        $(parent)
          .removeClass(ClassName.OPEN)
          .trigger($.Event(Event.HIDDEN, relatedTarget));
      }
    }

    static _getParentFromElement(element) {
     let parent;
     //let selector = Util.getSelectorFromElement(element)
      let selector = Selector.WINDOWWRAP;
     if (selector) {
       parent = $(selector)[0];
     }

     return parent || element.parentNode;
    }

    static _dataApiKeydownHandler(event) {
     if (!/(38|40|27|32|37|39)/.test(event.which) ||
        /input|textarea/i.test(event.target.tagName)) {
       return;
     }

     event.preventDefault();
     event.stopPropagation();

     let parent = Lincoln._getParentFromElement(this);
     let isActive = $(parent).hasClass(ClassName.OPEN);

      if ((!isActive && event.which !== ESCAPE_KEYCODE) ||
           (isActive && event.which === ESCAPE_KEYCODE)) {

        if (event.which === ESCAPE_KEYCODE) {
          let toggle = $(parent).find(Selector.MENUTRIGGER)[0];
          $(toggle).trigger('focus');
        }

        $(this).trigger('click');
        return;
      }

      let items = $.makeArray($(Selector.VISIBLE_ITEMS));

      items = items.filter((item) => {
        return item.offsetWidth || item.offsetHeight;
      })

      if (!items.length) {
        return;
      }

      let index = items.indexOf(event.target);

      if (event.which === ARROW_UP_KEYCODE && index > 0) { // up
        index--;
      }

      if (event.which === ARROW_DOWN_KEYCODE && index < items.length - 1) { // down
        index++;
      }

      if (index < 0) {
        index = 0;
      }

      items[index].focus();
     }
  } // End Class Lincoln

  $(document)
  .on(Event.KEYDOWN_DATA_API, Selector.MENUTRIGGER, Lincoln._dataApiKeydownHandler)
  .on(Event.KEYDOWN_DATA_API, Selector.MENU, Lincoln._dataApiKeydownHandler)
  .on(Event.KEYDOWN_DATA_API, Selector.VISIBLE_ITEMS, Lincoln._dataApiKeydownHandler)
  .on(Event.CLICK_DATA_API, Lincoln._clearMenu)
  .on(Event.CLICK_DATA_API, Selector.MENUTRIGGER, Lincoln.prototype.toggle)
  .on(Event.CLICK_DATA_API, Selector.SEARCH_BAR, (e) => {
    // allow clicks on the input
    e.stopPropagation()
  });


  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME]             = Lincoln._jQueryInterface
  $.fn[NAME].Constructor = Lincoln
  $.fn[NAME].noConflict  = function () {
    $.fn[NAME] = JQUERY_NO_CONFLICT
    return Lincoln._jQueryInterface
  }

  return Lincoln;
})(jQuery);

export default Lincoln;
