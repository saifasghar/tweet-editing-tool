import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TweetService } from '../services/tweet.service';

@Component({
  selector: 'app-tweet',
  templateUrl: './tweet.component.html',
  styleUrls: ['./tweet.component.css']
})
export class TweetComponent {

  constructor(private route: ActivatedRoute, private tweetService: TweetService) { }

  @ViewChild('card') cardElementRef!: ElementRef;
  @ViewChild('content') contentElement!: ElementRef;
  @ViewChild('timestamp') timeElement!: ElementRef;
  @ViewChild('styleMainBtn') styleMainBtn!: ElementRef;
  @ViewChild('responses') responsesElement!: ElementRef;
  @ViewChild('canvasEl') canvasElementRef!: ElementRef;
  @ViewChild('canvasElReal') realCanvasElementRef!: ElementRef;
  @ViewChild('tempCanvas') tempCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('avatarImage') loadedAvatarImage: any = null;

  public tweet: any = null;
  private cardElement!: any;
  public resizingHandle: any;
  private canvasElement!: any;
  private canvasContext!: any;
  public recievedId: string = '';
  public initialMouseX!: number;
  public initialMouseY!: number;
  public initialCanvasWidth!: number;
  public isResizing: boolean = false;
  public showCanvas: boolean = false;
  public initialCanvasHeight!: number;

  // Variables to make tweet editable
  public gradientColor1: string = '#0074E4'; // Initial color
  public gradientColor2: string = '#FF6B8B'; // Initial color
  public padding: number = 15;
  public titleFontSize: number = 16;
  public timeAndResponseLabelFontSize: number = 12;
  public titleColor: string = '#000000';
  public timeAndResponseLabelColor: string = '#7a8b97';
  public textColor: string = '#000000';
  public responseValueColor: string = '#000000';
  public textFontSize: number = 16;
  public avatarSize: number = 40;
  public borderRadius: number = 10;
  public minCanvasWidth: number = 500;
  public cardElementMaxWidth!: number;
  public showResponses: boolean = true;
  public havePadding: boolean = true;
  public haveBorder: boolean = false;
  public tweetGradientType: string = 'light';
  public tweetGradients = {
    light: ['rgba(255, 255, 255, 0.5)', 'rgba(255, 255, 255, 0.95)'],
    dark: ['rgb(95, 108, 138)', 'rgb(48, 59, 94)', 'rgb(14, 18, 38)']
  }
  public canvasGradients: any = {
    darkblue: {
      value: ['rgb(95, 108, 138)', 'rgb(48, 59, 94)', 'rgb(14, 18, 38)'],
      selected: true
    },
    skyblue: {
      value: ['#ace0f9', '#fff1eb'],
      selected: false
    },
    pink: {
      value: ['#FF61D2', '#FE9090'],
      selected: false
    },
    lightpurple: {
      value: ['#A9C9FF', '#FFBBEC'],
      selected: false
    },
    darkpurple: {
      value: ['rgb(253, 230, 138)', 'rgb(124, 58, 237)', 'rgb(12, 74, 110)'],
      selected: false
    },
    dark: {
      value: ['rgb(17, 24, 39)', 'rgb(75, 85, 99)'],
      selected: false
    },
  }

  // Resize Canvas
  onCanvasMouseDown(event: MouseEvent) {
    if (this.isResizing) return;
    this.isResizing = true;
    this.initialMouseX = event.clientX;
    this.initialMouseY = event.clientY;
    this.initialCanvasWidth = parseInt(this.canvasElement.style.width);
    this.initialCanvasHeight = parseInt(this.canvasElement.style.height);

    document.addEventListener('mousemove', this.resizeCanvas);
    document.addEventListener('mouseup', this.onCanvasMouseUp);
  }
  onCanvasMouseMove(event: MouseEvent) {
    if (this.isResizing) {
      const deltaX = event.clientX - this.initialMouseX;
      const deltaY = event.clientY - this.initialMouseY;

      this.canvasElement.style.width = this.initialCanvasWidth + deltaX;
      this.canvasElement.style.height = this.initialCanvasHeight + deltaY;

      this.drawTweet(this.canvasElement.width, this.canvasElement.height, false);

      event.preventDefault();
    }
  }
  onResizeHandleMouseDown(handlePosition: string, event: MouseEvent) {
    this.isResizing = true;
    this.initialMouseX = event.clientX;
    this.initialMouseY = event.clientY;
    this.initialCanvasWidth = parseInt(this.canvasElement.style.width);
    this.initialCanvasHeight = parseInt(this.canvasElement.style.height);
    this.resizingHandle = handlePosition;

    document.addEventListener('mousemove', this.resizeCanvas);
    document.addEventListener('mouseup', this.onCanvasMouseUp);
  }
  resizeCanvas = (event: MouseEvent) => {
    if (!this.havePadding) {
      this.havePadding = true;
    }
    const deltaX = event.clientX - this.initialMouseX;
    const deltaY = event.clientY - this.initialMouseY;

    switch (this.resizingHandle) {
      case 'left':
        if (this.initialCanvasWidth - deltaX >= this.minCanvasWidth) {
          this.canvasElement.style.width = (this.initialCanvasWidth - deltaX) + 'px';
        }
        break;
      case 'right':
        if (this.initialCanvasWidth + deltaX >= this.minCanvasWidth) {
          this.canvasElement.style.width = (this.initialCanvasWidth + deltaX) + 'px';
        }
        break;
      case 'bottom':
        if (this.initialCanvasHeight + deltaY > this.cardElement.offsetHeight + 100) {
          this.canvasElement.style.height = (this.initialCanvasHeight + deltaY) + 'px';
        }
        break;
      case 'top':
        if (this.initialCanvasHeight - deltaY > this.cardElement.offsetHeight + 100) {
          this.canvasElement.style.height = (this.initialCanvasHeight - deltaY) + 'px';
        }
        break;
    }
    this.drawTweet(parseInt(this.canvasElement.style.width), parseInt(this.canvasElement.style.height), false)
    event.preventDefault();
  }
  onCanvasMouseUp = () => {
    this.isResizing = false;

    document.removeEventListener('mousemove', this.resizeCanvas);
    document.removeEventListener('mouseup', this.onCanvasMouseUp);
  }
  fillTweetGradient(ctx: any, x: number, y: number, width: number, height: number) {
    const gradientFill = ctx.createLinearGradient(x, y, x + width, y + height);
    if (this.tweetGradientType == 'dark') {
      gradientFill.addColorStop(0, this.tweetGradients.dark[0]);
      gradientFill.addColorStop(0.5, this.tweetGradients.dark[1]);
      gradientFill.addColorStop(1, this.tweetGradients.dark[2]);
    } else if (this.tweetGradientType == 'light') {
      gradientFill.addColorStop(0, this.tweetGradients.light[0]);
      gradientFill.addColorStop(0.8, this.tweetGradients.light[1]); // 80% mark
      gradientFill.addColorStop(1, this.tweetGradients.light[1]);
    }
    // Apply the gradient fill to the rectangle
    ctx.fillStyle = gradientFill;
    ctx.fill();
  }

  // Canvas Functions
  increaseResolution(canvasWidth: number, canvasHeight: number) {

    this.canvasElement.width = canvasWidth * devicePixelRatio;
    this.canvasElement.height = canvasHeight * devicePixelRatio;
    this.canvasContext.scale(devicePixelRatio, devicePixelRatio);

    // To increase the resolution even further
    // let scaleFactor = 20;
    // this.canvasElement.width = canvasWidth * scaleFactor;
    // this.canvasElement.height = canvasHeight * scaleFactor;
    // this.canvasContext.scale(scaleFactor, scaleFactor);

    this.canvasElement.style.width = canvasWidth + 'px';
    this.canvasElement.style.height = canvasHeight + 'px';
  }
  drawCanvasGradient(canvasHeight: number, canvasWidth: number) {
    // Draw the gradient background
    const gradient = this.canvasContext.createLinearGradient(0, 0, 0, canvasHeight);
    let selectedGradient = '';
    for (let gradient in this.canvasGradients) {
      if (this.canvasGradients[gradient].selected) {
        selectedGradient = gradient;
        break;
      }
    }
    if (selectedGradient === 'darkblue') {
      this.styleMainBtn.nativeElement.style.backgroundImage = 'linear-gradient(45deg, rgb(95, 108, 138) 0%, rgb(48, 59, 94) 100%)';
      gradient.addColorStop(0, this.canvasGradients.darkblue.value[0]);
      gradient.addColorStop(0.8, this.canvasGradients.darkblue.value[1]); // 80% mark
      gradient.addColorStop(1, this.canvasGradients.darkblue.value[2]);
    } else if (selectedGradient === 'skyblue') {
      this.styleMainBtn.nativeElement.style.backgroundImage = 'linear-gradient(to top, #fff1eb 0%, #ace0f9 100%)';
      gradient.addColorStop(0, this.canvasGradients.skyblue.value[0]);
      gradient.addColorStop(1, this.canvasGradients.skyblue.value[1]);
    } else if (selectedGradient === 'pink') {
      this.styleMainBtn.nativeElement.style.backgroundImage = 'linear-gradient(to bottom right, #FF61D2, #FE9090)';
      gradient.addColorStop(0, this.canvasGradients.pink.value[0]);
      gradient.addColorStop(1, this.canvasGradients.pink.value[1]);
    } else if (selectedGradient === 'lightpurple') {
      this.styleMainBtn.nativeElement.style.backgroundImage = 'linear-gradient(180deg, #A9C9FF 0%, #FFBBEC 100%)';
      gradient.addColorStop(0, this.canvasGradients.lightpurple.value[0]);
      gradient.addColorStop(1, this.canvasGradients.lightpurple.value[1]);
    } else if (selectedGradient === 'darkpurple') {
      this.styleMainBtn.nativeElement.style.backgroundImage = 'radial-gradient(at center bottom, rgb(253, 230, 138), rgb(124, 58, 237)';
      gradient.addColorStop(1, this.canvasGradients.darkpurple.value[0]);
      gradient.addColorStop(0.5, this.canvasGradients.darkpurple.value[1]);
      gradient.addColorStop(0, this.canvasGradients.darkpurple.value[2]);
    } else if (selectedGradient === 'dark') {
      this.styleMainBtn.nativeElement.style.backgroundImage = 'linear-gradient(to top, rgb(17, 24, 39), rgb(75, 85, 99))';
      gradient.addColorStop(0, this.canvasGradients.dark.value[0]);
      gradient.addColorStop(1, this.canvasGradients.dark.value[1]);
    }

    this.canvasContext.fillStyle = gradient;
    this.canvasContext.fillRect(0, 0, canvasWidth, canvasHeight);
  }
  async drawRoundedRectangleWithText(x: number, y: number, width: number, height: number, canvasWidth: number) {

    // Condition to change the card's width upon resizing the canvas
    if (this.havePadding) {
      if (width + 100 > canvasWidth) {
        width = width - ((width + 100) - canvasWidth);
        this.cardElement.style.width = width + 'px';
        x = (canvasWidth - width) / 2;
      } else if ((width + 100 < canvasWidth) && (width + (canvasWidth - (width + 100))) < this.cardElementMaxWidth) {
        width = width + (canvasWidth - (width + 100));
        this.cardElement.style.width = width + 'px';
        x = (canvasWidth - width) / 2;
      }
    }
    const ctx = this.canvasContext;
    if (this.haveBorder) {
      // Draw the rounded rectangle with gradient and custom border
      ctx.beginPath();
      ctx.moveTo(x + this.borderRadius, y);
      ctx.lineTo(x + width - this.borderRadius, y);
      ctx.arcTo(x + width, y, x + width, y + this.borderRadius, this.borderRadius);
      ctx.lineTo(x + width, y + height - this.borderRadius);
      ctx.arcTo(x + width, y + height, x + width - this.borderRadius, y + height, this.borderRadius);
      ctx.lineTo(x + this.borderRadius, y + height);
      ctx.arcTo(x, y + height, x, y + height - this.borderRadius, this.borderRadius);
      ctx.lineTo(x, y + this.borderRadius);
      ctx.arcTo(x, y, x + this.borderRadius, y, this.borderRadius);
      ctx.closePath();

      // Create a custom border gradient
      const borderGradient = ctx.createLinearGradient(x, y, x + width, y + height);
      borderGradient.addColorStop(0, 'rgba(243, 244, 246, 0.5)');
      borderGradient.addColorStop(0.5, 'rgba(229, 231, 235, 0.4)');
      borderGradient.addColorStop(1, 'rgba(243, 244, 246, 0.3)');

      // Increase the border thickness
      ctx.lineWidth = 10; // Adjust this value as needed

      // Fill the rounded rectangle with the gradient
      ctx.fillStyle = this.fillTweetGradient(ctx, x, y, width, height);
      ctx.fill();

      // Apply the custom border gradient
      ctx.strokeStyle = borderGradient; // Border gradient
      ctx.stroke();
    } else {
      // Draw the rounded rectangle with gradient and white border
      ctx.beginPath();
      ctx.moveTo(x + this.borderRadius, y);
      ctx.lineTo(x + width - this.borderRadius, y);
      ctx.arcTo(x + width, y, x + width, y + this.borderRadius, this.borderRadius);
      ctx.lineTo(x + width, y + height - this.borderRadius);
      ctx.arcTo(x + width, y + height, x + width - this.borderRadius, y + height, this.borderRadius);
      ctx.lineTo(x + this.borderRadius, y + height);
      ctx.arcTo(x, y + height, x, y + height - this.borderRadius, this.borderRadius);
      ctx.lineTo(x, y + this.borderRadius);
      ctx.arcTo(x, y, x + this.borderRadius, y, this.borderRadius);
      ctx.closePath();

      // Fill the rounded rectangle with gradient
      this.fillTweetGradient(ctx, x, y, width, height);
    }


    // Calculate positions and dimensions for the round image, title, and text
    // const imageMargin = 15;
    const avatarXPos = x + this.padding;
    const avatarYPos = y + this.padding;

    const titleMarginFromImage = 10;
    const titleLineHeightAdjustment = this.titleFontSize / 3;
    const titleXPos = avatarXPos + this.avatarSize + titleMarginFromImage;
    const titleYPos = avatarYPos;

    const textXPos = x + this.padding;
    const textMarginFromImage = 20;
    const textLineHeightAdjustment = this.textFontSize / 2;
    let textYPos = y + this.avatarSize + this.padding + textMarginFromImage + textLineHeightAdjustment;

    ctx.save();
    ctx.beginPath();
    ctx.arc(
      avatarXPos + this.avatarSize / 2,
      avatarYPos + this.avatarSize / 2,
      this.avatarSize / 2,
      0,
      Math.PI * 2
    );
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(this.loadedAvatarImage.nativeElement, avatarXPos, avatarYPos, this.avatarSize, this.avatarSize);
    ctx.restore();

    // Draw the bold title
    ctx.fillStyle = this.titleColor;
    ctx.font = `bold ${this.titleFontSize}px Arial`;
    ctx.fillText(this.tweet.title, titleXPos, (titleYPos + titleLineHeightAdjustment) + (this.avatarSize / 2));

    // Draw the text with padding
    ctx.fillStyle = this.textColor;
    ctx.font = `${this.textFontSize}px Arial`;

    const lines = this.tweet.text.split('\n');

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const words = lines[lineIdx].split(' ');
      let line = '';

      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;

        if (testWidth > width - (2 * this.padding) && i > 0) {
          ctx.fillText(line, textXPos, textYPos);
          line = words[i] + ' ';
          textYPos += this.textFontSize + textLineHeightAdjustment; // Adjust for line height
        } else {
          line = testLine;
        }
      }

      ctx.fillText(line.trim(), textXPos, textYPos);

      textYPos += this.textFontSize + textLineHeightAdjustment; // Adjust for line height between lines
    }

    // Draw the time
    const timeXPos = textXPos;
    // const timeMarginFromText = 10;
    const timeYPos = textYPos; // Margin-top for the time

    ctx.fillStyle = this.timeAndResponseLabelColor;
    ctx.font = `${this.timeAndResponseLabelFontSize}px Arial`;
    ctx.fillText(this.tweet.time, timeXPos, timeYPos);

    // Draw the responses
    if (this.showResponses) {
      const responses = [
        { label: 'Repost', value: this.tweet.reposts, color: this.responseValueColor },
        { label: 'Quotes', value: this.tweet.quotes, color: this.responseValueColor },
        { label: 'Likes', value: this.tweet.likes, color: this.responseValueColor },
        { label: 'Bookmarks', value: this.tweet.bookmarks, color: this.responseValueColor }
      ];

      ctx.font = `bold ${this.timeAndResponseLabelFontSize}px Arial`; // Bold font for response label
      const lineHeight = 18; // Line height for responses

      let responseX = textXPos;
      const responseY = timeYPos + 15 + lineHeight; // Margin-top for responses

      for (const response of responses) {
        ctx.fillStyle = response.color; // Set label color
        ctx.fillText(`${response.value}`, responseX, responseY);

        const labelX = responseX + ctx.measureText(`${response.value} `).width;
        ctx.font = this.timeAndResponseLabelFontSize; // Regular font for response value
        ctx.fillStyle = this.timeAndResponseLabelColor; // Set label color
        ctx.fillText(`${response.label}`, labelX, responseY);

        responseX = labelX + ctx.measureText(`${response.label} `).width + 10; // Adjust margin
        ctx.font = `bold ${this.timeAndResponseLabelFontSize}px Arial`; // Reset font to bold for the next label
      }
    }
  }


  // Draw on Canvas
  drawTweet(canvasWidth: number, canvasHeight: number, setResolution: boolean) {

    // Disable image smoothing for text
    this.canvasContext.imageSmoothingEnabled = false;

    const cardWidth = this.cardElement.offsetWidth;
    const cardHeight = this.cardElement.offsetHeight;
    if (setResolution) {
      canvasWidth = cardWidth + (this.havePadding ? 300 : 0);
      canvasHeight = cardHeight + (this.havePadding ? 200 : 0);
    }

    // Calculate the position to center the scaled card within the canvas
    const xPos = (canvasWidth - cardWidth) / 2;
    const yPos = (canvasHeight - cardHeight) / 2;

    // Clear the existing content from the canvas
    this.canvasContext.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

    // Increase the canvas resolution
    this.increaseResolution(canvasWidth, canvasHeight);

    // Draw the gradient background
    this.drawCanvasGradient(canvasHeight, canvasWidth);

    // Draw Rectangle on canvas for tweet
    // const text = 'Although there are some bad things in the world, remember that there are many good things too';
    this.drawRoundedRectangleWithText(xPos, yPos, cardWidth, cardHeight, canvasWidth);

    this.showCanvas = true;
  }


  ngOnInit() {
    this.recievedId = this.route.snapshot.paramMap.get('id') || '';
    if (this.recievedId !== '') {
      this.tweetService.fetchTweet(this.recievedId).subscribe(res => {
        this.tweet = res.tweet;
        setTimeout(() => {
          this.cardElement = this.cardElementRef.nativeElement;
          this.cardElementMaxWidth = this.cardElement.offsetWidth;
          this.canvasElement = this.canvasElementRef.nativeElement;
          this.canvasContext = this.canvasElement.getContext('2d', { willReadFrequently: true });
          this.drawTweet(810, 410, true);
        }, 500)
      })
    }
  }
  // ngAfterViewInit() {

  // }

  // Buttons for manuplating styles
  changeTweetGradient() {
    if (this.tweetGradientType === 'dark') {
      this.tweetGradientType = 'light';
      this.textColor = '#000000';
      this.titleColor = '#000000';
      this.responseValueColor = '#000000';

    } else {
      this.tweetGradientType = 'dark';
      this.textColor = '#ffffff';
      this.titleColor = '#ffffff';
      this.responseValueColor = '#ffffff';
    }
    this.drawTweet(parseInt(this.canvasElement.style.width), parseInt(this.canvasElement.style.height), false);
  }
  toggleResponses() {
    this.showResponses = !this.showResponses;
    setTimeout(() => {
      this.drawTweet(parseInt(this.canvasElement.style.width), parseInt(this.canvasElement.style.height), false);
    }, 50)
  }
  changeTextSize() {
    if (this.textFontSize == 16) {
      this.textFontSize = 24;
      this.timeAndResponseLabelFontSize = 14;
      this.minCanvasWidth = 560;
    } else {
      this.textFontSize = 16;
      this.timeAndResponseLabelFontSize = 12;
      this.minCanvasWidth = 500;
    }
    this.contentElement.nativeElement.style.fontSize = this.textFontSize + 'px';
    this.timeElement.nativeElement.style.fontSize = this.timeAndResponseLabelFontSize + 'px';
    if (this.showResponses) {
      this.responsesElement.nativeElement.style.fontSize = this.timeAndResponseLabelFontSize + 'px';
    }
    setTimeout(() => {
      this.drawTweet(parseInt(this.canvasElement.style.width), parseInt(this.canvasElement.style.height), false);
    }, 50)
  }
  toggleNoPadding() {
    this.havePadding = !this.havePadding;
    setTimeout(() => {
      this.drawTweet(parseInt(this.canvasElement.style.width), parseInt(this.canvasElement.style.height), true);
    }, 50)
  }
  toggleBorder() {
    this.haveBorder = !this.haveBorder;
    setTimeout(() => {
      this.drawTweet(parseInt(this.canvasElement.style.width), parseInt(this.canvasElement.style.height), false);
    }, 50)
  }
  selectGradient(selectedGradient: string) {
    for (let gradient in this.canvasGradients) {
      if (this.canvasGradients[gradient] === this.canvasGradients[selectedGradient]) {
        this.canvasGradients[gradient].selected = true;
      } else {
        this.canvasGradients[gradient].selected = false;
      }
    }
    setTimeout(() => {
      this.drawTweet(parseInt(this.canvasElement.style.width), parseInt(this.canvasElement.style.height), false);
    }, 50)
  }
  copyCanvasAsSvg() {
    // Get the canvas element
    const canvasElement = this.canvasElement;

    // Create a new SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    let width = parseInt(canvasElement.style.width).toString();
    let height = parseInt(canvasElement.style.height).toString();
    svg.setAttribute('width', canvasElement.width.toString());
    svg.setAttribute('height', canvasElement.height.toString());

    // Create a new foreignObject element and append the canvas as an image
    const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
    foreignObject.setAttribute('width', '100%');
    foreignObject.setAttribute('height', '100%');
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = canvasElement.toDataURL('image/png');
    foreignObject.appendChild(image);
    svg.appendChild(foreignObject);

    // Convert the SVG to a data URI
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);

    // Create a temporary anchor element and trigger a download
    const link = document.createElement('a');
    link.href = svgUrl;
    link.download = 'canvas_image.svg';
    link.click();

  }
  copyCanvasAsPng() {
    // Get the canvas element
    const canvasElement = this.canvasElement;

    // Create a temporary anchor element
    const link = document.createElement('a');

    // Convert the canvas content to a data URL
    const canvasDataUrl = canvasElement.toDataURL('image/png');

    // Set the data URL as the anchor's href and set the download attribute
    link.href = canvasDataUrl;
    link.download = `Tweet by ${this.tweet.title}`;

    // Trigger the anchor click event
    link.click();
  }
}
