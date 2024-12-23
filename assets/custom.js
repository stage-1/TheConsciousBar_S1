window.theme = window.theme || {};

theme.initWhenVisible = function(options) {
  const threshold = options.threshold ? options.threshold : 0;

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (typeof options.callback === 'function') {
          options.callback();
          observer.unobserve(entry.target);
        }
      }
    });
  }, {rootMargin: `0px 0px ${threshold}px 0px`});

  observer.observe(options.element);
};

class ScrollingPromotion extends HTMLElement {
  constructor() {
    super();

    this.config = {
      moveTime: parseFloat(this.dataset.speed), // 100px going to move for
      space: 100, // 100px
    };

    this.promotion = this.querySelector('.promotion');

    theme.initWhenVisible({
      element: this,
      callback: this.init.bind(this),
      threshold: 600
    });
  }

  init() {
    if (this.childElementCount === 1) {
      this.promotion.classList.add('promotion--animated');

      for (let index = 0; index < 10; index++) {
        this.clone = this.promotion.cloneNode(true);
        this.clone.setAttribute('aria-hidden', true);
        this.appendChild(this.clone);

        const imageWrapper = this.clone.querySelector('.media-wrapper');
        if (imageWrapper) {
          imageWrapper.classList.remove('loading');
        }
      }

      const animationTimeFrame = (this.promotion.clientWidth / this.config.space) * this.config.moveTime;
      this.style.setProperty('--duration', `${animationTimeFrame}s`);

      // pause when out of view
      const observer = new IntersectionObserver((entries, _observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.scrollingPlay();
          } else {
            this.scrollingPause();
          }
        });
      }, {rootMargin: '0px 0px 50px 0px'});

      observer.observe(this);
    }
  }

  scrollingPlay() {
    console.log('play');
    // this.classList.remove('scrolling-promotion--paused');
  }

  scrollingPause() {
    console.log('paused');
    // this.classList.add('scrolling-promotion--paused');
  }
}
customElements.define('scrolling-promotion', ScrollingPromotion);

// PRODUCT CARD VIDEO ON HOVER
class CardVideo extends HTMLElement {
  constructor() {
    super();
    
    this.addEventListener("mouseover", this.mouseIn.bind(this));
    this.addEventListener("mouseleave", this.mouseLeave.bind(this));
    this.addEventListener("touchstart", this.mouseIn.bind(this));
    this.addEventListener("touchend", this.mouseLeave.bind(this));
  }

  mouseIn(){
    this.videos = this.querySelector('.product-card__figure').querySelectorAll("video");
    if(this.videos.length) {
      this.firstVideo = this.videos[0];
      this.secondVideo = this.videos[1];
      this.classList.add('hovered', 'mousein');
      this.classList.remove('mouseleave');   
      this.loadVideo(this.firstVideo); 
      this.resetVideo(this.secondVideo);
    }
  }
  
  mouseLeave(){
    if(this.videos.length) {
      this.classList.remove('mousein');
      this.classList.add('mouseleave');   
      this.loadVideo(this.secondVideo);   
      this.resetVideo(this.firstVideo);
    }
  }

  loadVideo(video) {
    if (!video) return;

    const promise = video.play();
    if (promise !== undefined) {
      promise
        .then(() => {
          // Autoplay started
        })
        .catch((error) => {
          // Autoplay was prevented.
          video.muted = true;
          video.play();
        });
    }
  }

  resetVideo(video) {
    if (!video) return;

    const promise = video.play();
    if (promise !== undefined) {
      promise
        .then(() => {
          // Autoplay started
          video.currentTime = 0;
        })
        .catch((error) => {
          // Autoplay was prevented.
          video.muted = true;
          video.play();
        });
    }
  }  
}

customElements.define("card-video", CardVideo);


// DISCOUNT ON QUANTITY
class DiscountQty extends HTMLElement {
  constructor() {
    super();

    this.buttons = this.querySelectorAll('.discount_button');
    this.qtyInput = this.querySelector('[name="quantity"]');

    this.quantitySelectorInput = document.querySelector('quantity-selector .quantity-selector__input');

    this.buttons.forEach(btn => {
      btn.addEventListener("click", this.init.bind(this));
    })
  }

  init(event) {
    this.buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    // this.qtyInput.value = event.target.dataset.value;
    const newValue = event.target.dataset.value;

    this.qtyInput.value = newValue;
    if (this.quantitySelectorInput) {
      this.quantitySelectorInput.value = newValue;

      this.quantitySelectorInput.dispatchEvent(new Event('change', { bubbles: true }));
      this.quantitySelectorInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
}

customElements.define("discount-qty", DiscountQty);


// UPDATE SUBSCRIPTION PRICE
class UpdateSubscriptionPrice extends HTMLElement {
  constructor() {
    super();    

    this.blocks = this.querySelectorAll('[data-block-type="@app"]');
    this.blocks.forEach(block => {
      block.addEventListener("click", this.init.bind(this));
    })
  }

  init() {
    setTimeout(() => {
      this.sellingPlanId = this.querySelector('input[name="selling_plan"]').value;
      
      if(this.sellingPlanId == '') {
        this.sellingPrice = document.querySelector(`#selling_plan_app_container #label_one_time_purchase input`).getAttribute('data-variant-price');
      } else {
        this.sellingPrice = document.querySelector(`#selling_plan_app_container input[data-selling-plan-id="${this.sellingPlanId}"]`).getAttribute('data-variant-price');
      }
      
      this.calcPrice(this.sellingPrice);
    }, 400)    
  }

  calcPrice(price){
    document.querySelectorAll('discount-qty .discount_button').forEach((btn, index) => {
      if(index !== 0) {
        const getPercentage = parseFloat(btn.getAttribute('data-percentage')) / 100;
        const calcItemPrice = (price - (price * getPercentage)).toFixed(2);
        btn.querySelector('span').innerHTML = `$${calcItemPrice} each`; 
      }
    })
  }
}

customElements.define("update-subsprice", UpdateSubscriptionPrice);

// PRODUCT LIST DROPDOWN
class ProductlistDropdown extends HTMLElement {
  constructor() {
    super();    

    this.button = this.querySelector('.button_product_list');
    this.items = this.querySelectorAll('.product_item_label');

    this.button.addEventListener("click", this.toggleDropdown.bind(this));   
    this.items.forEach(item => {
      item.addEventListener("click", this.toggleDropdown.bind(this));
    });
      
    document.body.addEventListener("click", this.close.bind(this));
  }

  toggleDropdown() {
    this.classList.toggle('open');
  }
  
  close(event) {
    if(event.target.matches('.button_product_list') || event.target.matches('.product_item_label')) return;
    this.classList.remove('open');
  }
}

customElements.define("productlist-dropdown", ProductlistDropdown);

// SCROLLING IMAGE
class MarqueeImage extends HTMLElement {
  constructor() {
    super();

    this.config = {
      moveTime: 1,
      space: 100,
    };

    this.promotion = this.querySelector('.promotion');
    this.promotionWrap = this.querySelector('.promotion_wrap');
    this.init();
  }

  init() {
    if (this.promotionWrap.childElementCount === 1) {
      for (let index = 0; index < 10; index++) {
        this.clone = this.promotion.cloneNode(true);
        this.clone.setAttribute('aria-hidden', true);
        this.promotionWrap.appendChild(this.clone);
      }

      const animationTimeFrame = (this.promotion.clientWidth / this.config.space) * this.config.moveTime;
      this.style.setProperty('--duration', `${animationTimeFrame}s`);
    }
  }
}

customElements.define('marquee-image', MarqueeImage);


