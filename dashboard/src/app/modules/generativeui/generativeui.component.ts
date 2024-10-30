import { Component } from '@angular/core';
import { io } from 'socket.io-client';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

const socket = io('http://localhost:5000/');

@Component({
  selector: 'app-genarativeui', 
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule], 
  templateUrl: './generativeui.component.html',
  styleUrls: ['./generativeui.component.scss'] 
})
export class GenerativeuiComponent {
  title = 'client';
  genUI: boolean = true;
  isDragging = false;
  videoUrl: string = '';
  imageUrl: string = '';
  selectedFile: File | null = null;
  productForm: FormGroup;
  imagePreview: string | ArrayBuffer | null = null;
  videoPreview: string | ArrayBuffer | null = null;
  selectedOptionVideo: string = 'Upload-Video';
  selectedOptionImage: string = 'Upload-Image';

  constructor(private fb: FormBuilder) {
    this.productForm = this.fb.group({
      productName: [''],
      description: [''],
      productLink: [''],
      textMessage: [''],
      template: ['none'],
      imageTemplate: ['none'],
      imageOption: ['upload'],
      imageUrl: [null],
      imageLink: [''],
      videoOption: ['upload'],
      videoUrl: [null],
      videoLink: [''],
    });

    this.productForm.get('template')?.valueChanges.subscribe((value) => {
      this.clearTemplateFields();
    });
  }

  clearTemplateFields() {
    this.productForm.patchValue({
      imageTemplate: 'none',
      imageOption: 'upload',
      imageLink: '',
      imageUrl: null,
      videoOption: 'upload',
      videoLink: '',
      videoUrl: null,
    });

    this.imagePreview = null;
    this.videoPreview = null;
  }

  ngOnInit() {
    socket.on('connect', () => {
      console.log('connected');
    });

    socket.on('disconnect', () => {
      console.log('disconnected');
    });

    socket.on('welcome', (data) => {
      console.log('data: ' + data);
    });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;

    if (event.dataTransfer?.files.length) {
      const file = event.dataTransfer.files[0];

      if (this.productForm.get('template')?.value === 'Image') {
        this.selectedFile = file;
        this.generateImagePreview(file);
      } else if (this.productForm.get('template')?.value === 'Video') {
        this.selectedFile = file;
        this.generateVideoPreview(file);
      }
    }
  }

  onBrowseClick(): void {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput.click();
  }

  onFileSelected(event: Event, type: string) {
    const target = event.target as HTMLInputElement;

    if (target.files && target.files.length > 0) {
      const file = target.files[0];

      if (type === 'image') {
        this.selectedFile = file;
        this.generateImagePreview(file);
        this.clearVideoFields();
      } else if (type === 'video') {
        this.selectedFile = file;
        this.generateVideoPreview(file);
        this.clearImageFields();
      }
    } else {
      this.selectedFile = null;
      if (type === 'image') {
        this.imagePreview = null;
      } else if (type === 'video') {
        this.videoPreview = null;
      }
    }
  }

  onOptionChange(option: string): void {
    if (option === 'Image') {
      this.clearVideoFields();
      this.selectedOptionImage = 'Upload-Image';
      this.selectedFile = null;
      this.imagePreview = null;
    } else if (option === 'Video') {
      this.clearImageFields();
      this.selectedOptionVideo = 'Upload-Video';
      this.selectedFile = null;
      this.videoPreview = null;
    }
  }

  clearImageFields() {
    this.productForm.patchValue({
      imageTemplate: 'none',
      imageOption: 'upload',
      imageLink: '',
      imageUrl: null,
    });
    this.imagePreview = null;
  }

  clearVideoFields() {
    this.productForm.patchValue({
      videoOption: 'upload',
      videoLink: '',
      videoUrl: null,
    });
    this.videoPreview = null;
  }

  generateImagePreview(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
    };
    reader.readAsDataURL(file);
  }

  generateVideoPreview(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.videoPreview = reader.result;
    };
    reader.readAsDataURL(file);
  }

  removeSelectedFile() {
    this.selectedFile = null;
    this.imagePreview = null;
    this.videoPreview = null;
  }

  onVideoUrlChange() {
    this.productForm.patchValue({ videoUrl: this.videoUrl });
  }

  onImageUrlChange() {
    this.productForm.patchValue({ imageUrl: this.imageUrl });
  }

  onFileChange(event: any, fileType: string) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (fileType === 'image') {
          this.imagePreview = reader.result;
        } else if (fileType === 'video') {
          this.videoPreview = reader.result;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  onImageOptionChange() {
    if (this.productForm.get('imageOption')?.value === 'link') {
      this.productForm.patchValue({ imageUrl: null });
    } else {
      this.productForm.patchValue({ imageLink: '' });
    }
  }

  onVideoOptionChange() {
    if (this.productForm.get('videoOption')?.value === 'link') {
      this.productForm.patchValue({ videoUrl: null });
    } else {
      this.productForm.patchValue({ videoLink: '' });
    }
  }

  onSubmit() {
    const {
      productName,
      description,
      productLink,
      template,
      imageTemplate,
      imageOption,
      textMessage,
    } = this.productForm.value;

    let productHTML = '';
    let finalImageUrl = 
    imageOption === 'Upload-URL' ? this.productForm.get('imageLink')?.value : this.imagePreview
    let videoLink = this.productForm.get('videoLink')?.value;

    
    if (template === 'Image' && imageTemplate === 'Pre-Designed-Template') {
      productHTML = `
       <div class="product-list" id="product-notification" style="
  border-radius: 5px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  width: 300px;
  height: 150px;
  padding: 15px;
  position: fixed;
  text-align: center;
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
  right: 10px;
  bottom: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  border: 1px solid #ddd;
  background-color: white;
">
 <button onclick="closeNotification()" type="button" style="
     background-color: rgba(128, 128, 128, 0.3);
    color: #ffffff;
    border: none;
    border-radius: 5px;
    width: 20px;
    height: 20px;
    font-size: 12px;
    position: absolute;
    right: 10px;
    top: 10px;
    cursor: pointer;
    z-index: 50;
    display: flex;
    justify-content: center;
    align-items: center;
">
  <span style="color: #ffffff; font-weight: bold;">X</span>
</button>
  
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; align-items: center; height: 100%;">
    <div style="display: flex; flex-direction: column; align-items: start; justify-content: space-between; height: 100%;">
      <p style="margin: 0%; font-size: 12px; font-weight: bolder; text-align: start;">${productName}</p>
      <p style=" margin: 0; 
        font-size: 11px; 
        font-weight: bold; 
        text-align: start; 
        margin-top: 5px; 
        max-width: 120px;
        overflow: hidden;
        overflow-wrap: break-word;">${description}</p>
      <a href=${productLink} target="_blank" style="background-color: rgb(14, 14, 14); font-size: 9px; text-decoration: none; color: white; padding: 6px 26px; border-radius: 13px; box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15); margin-top: 5px;">Explore now</a>
    </div>
    <div style="position: relative;">
      <img src=${finalImageUrl} alt=${productName} style="width: 100%; max-height: 82px; position: absolute; top: -86px; right: 25px; opacity: 0.7; border-radius: 5px;">
      
      <img src=${finalImageUrl} alt=${productName} style="max-width: 100%; height: auto; border-radius: 5px;">
      
      <img src=${finalImageUrl} alt=${productName} style="width: 100%; max-height: 82px; position: absolute; bottom: -87px; right: -38px; opacity: 0.7; border-radius: 5px;">
    </div>
  </div>

</div>
`;
    }else if( imageTemplate === 'Background-Image-Template' ){
      productHTML = `
  <div
    class="product-list"
    id="product-notification"
    style="
      border-radius: 5px;
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
      width: 300px;
      height: 150px;
      padding: 15px;
      position: fixed;
      text-align: center;
      transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
      right: 10px;
      bottom: 20px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      overflow: hidden;
      border: 1px solid #ddd;
      background-image: url(${finalImageUrl});
      object-fit: cover;
      background-position: center;
      background-repeat: no-repeat;
      background-size: cover;
    "
  >
    <button
      onclick="closeNotification()"
      type="button"
      style="
        background-color: rgba(128, 128, 128, 0.3);
        color: #ffffff;
        border: none;
        border-radius: 5px;
        width: 20px;
        height: 20px;
        font-size: 12px;
        position: absolute;
        right: 10px;
        top: 10px;
        cursor: pointer;
        z-index: 50;
        display: flex;
        justify-content: center;
        align-items: center;
      "
    >
      <span style="color: #ffffff; font-weight: bold">X</span>
    </button>

    <div
      style="
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 25px;
        align-items: center;
        height: 100%;
        color: #ffffff;
      "
    >
      <div
        style="
          display: flex;
          flex-direction: column;
          align-items: start;
          justify-content: space-between;
          height: 100%;
        "
      >
        <p
          style="
            margin: 0%;
            font-size: 12px;
            font-weight: bolder;
            text-align: start;
          "
        >
         ${productName}
        </p>
        <p
          style="
            margin: 0;
            font-size: 11px;
            font-weight: bold;
            text-align: start;
            margin-top: 5px;
            max-width: 120px;
            overflow: hidden;
            overflow-wrap: break-word;
          "
        >
         ${description}
        </p>
        <a
          href="${productLink}"
          target="_blank"
          style="
            background-color: rgb(14, 14, 14);
            font-size: 9px;
            text-decoration: none;
            color: white;
            padding: 6px 26px;
            border-radius: 13px;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
            margin-top: 5px;
          "
          >Explore now</a
        >
      </div>
    </div>
  </div>`
    } else if (imageTemplate === 'Image-Upload') {
     productHTML = 
    `<div
     class="product-list"
     id="product-notification"
     style="
       border-radius: 5px;
       box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
       width: 300px;
       height: 150px;
       position: fixed;
       text-align: center;
       transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
       right: 10px;
       bottom: 20px;
       display: flex;
       flex-direction: column;
       justify-content: center;
       overflow: hidden;
       border: 1px solid #ddd;
     "
   >
     <button
       onclick="closeNotification()"
       type="button"
       style="
         background-color: rgba(128, 128, 128, 0.8);
         color: #ffffff;
         border: none;
         border-radius: 5px;
         width: 20px;
         height: 20px;
         font-size: 12px;
         position: absolute;
         right: 10px;
         top: 10px;
         cursor: pointer;
         z-index: 50;
         display: flex;
         justify-content: center;
         align-items: center;
       "
     >
       <span style="color: #ffffff; font-weight: bold">X</span>
     </button>
   
     <a href=${productLink} target="_blank" style=" height: 100%; width: 100%; background-image: url('${finalImageUrl}');
     object-fit: cover;
     background-position: center;
     background-repeat: no-repeat;
     background-size: cover;"></a>
   </div>`
    }else if (template === 'Video' && this.videoPreview) {
      productHTML = `
       <div
    class="product-list"
    id="product-notification"
    style="
      padding: 0px;
      position: fixed;
      right: 10px;
      bottom: 20px;
      width: 250px;
    "
  >
    <button onclick="closeNotification()" type="button" style="
     background-color: rgba(128, 128, 128, 1);
    color: #ffffff;
    border: none;
    border-radius: 5px;
    width: 20px;
    height: 20px;
    font-size: 12px;
    position: absolute;
    right: 10px;
    top: 10px;
    cursor: pointer;
    z-index: 50;
    display: flex;
    justify-content: center;
    align-items: center;
">
  <span style="color: #ffffff; font-weight: bold;">X</span>
</button>

      <a href=${productLink} target="_blank" >
    <video width="100%" height="100%" controls autoplay loop >
      <source src=${this.videoPreview} type="video/mp4" />
    </video>
    </a>
  </div>
      `;
    } else if (template === 'Video' && videoLink) {
      productHTML = `
        <div
          class="product-list"
          id="product-notification"
          style="
            padding: 0px;
            position: fixed;
            right: 10px;
            bottom: 20px;
            width: 250px;
          "
        >
          <button onclick="closeNotification()" type="button" style="
            background-color: rgba(128, 128, 128, 1);
            color: #ffffff;
            border: none;
            border-radius: 5px;
            width: 20px;
            height: 20px;
            font-size: 12px;
            position: absolute;
            right: 10px;
            top: 10px;
            cursor: pointer;
            z-index: 50;
            display: flex;
            justify-content: center;
            align-items: center;
          ">
            <span style="color: #ffffff; font-weight: bold;">X</span>
          </button>
    
          <div 
            style="width: 100%; height: 100%; position: relative; padding-top: 56.25%; cursor: pointer;"
            onclick="window.open('${productLink}', '_blank')"
          >
            <iframe 
              src=${videoLink+'?autoplay=1&mute=1'}
              style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: auto;" 
              frameborder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen>
            </iframe>
          </div> 
        </div>
      `;
    }else if(template === 'Text') {
      productHTML = `
      <div onclick="window.open('${productLink}', '_blank')"
      style="position: fixed; right: 15px; bottom: 15px; cursor: pointer;"
      >
       ${textMessage}
      </div>`
      }

    socket.emit('message', productHTML);

    console.log('Form submitted:', this.productForm.value);

    this.productForm.reset({
      template: 'none',
      imageOption: 'upload',
      videoOption: 'upload',
    });
    this.imagePreview = null;
    this.videoPreview = null;
  }
}