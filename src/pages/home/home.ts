import { Component } from '@angular/core';
import { NavController, LoadingController, ToastController, Config } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  imageURI: any;
  imageFileName: any;
  preview: any;
  b64Data: any;
  imgListArr: any;
  constructor(public navCtrl: NavController, private camera: Camera, private photoViewer: PhotoViewer,
    private transfer: FileTransfer,
    // private camera: Camera,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public http: HttpClient
  ) {

  }

  getPhoto() {
    const options: CameraOptions = {
      quality: 5,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }

    console.log("camera triggered");

    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      this.imageURI = imageData;
      this.uploadFile();
      // let base64Image = 'data:image/jpeg;base64,' + imageData;
      // console.log(base64Image);
      // this.photoViewer.show(imageData, 'My image title', {share: true});
    }, (err) => {
      // Handle error
    });
  }

  b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);

      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      var byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }

  getUploadedFiles() {
    console.log("get all images");
    this.http.get("http://35.237.106.103:3000/images")
      .subscribe(resposne => {
        this.imgListArr = resposne;
      }, error => {
        console.log(error);
      });
  }

  uploadFile() {
    let loader = this.loadingCtrl.create({
      content: "Uploading..."
    });
    loader.present();
    const fileTransfer: FileTransferObject = this.transfer.create();

    let options: FileUploadOptions = {
      fileKey: 'progress',
      fileName: new Date().getTime().toString(),
      chunkedMode: false,
      mimeType: "image/jpeg",
      headers: {}
    }

    fileTransfer.upload(this.imageURI, 'http://35.237.106.103:3000/uploadFile', options)
      .then((data) => {
        console.log(data + " Uploaded Successfully");
        // this.imageFileName = "http://192.168.0.7:8080/static/images/ionicfile.jpg"
        loader.dismiss();
        this.presentToast("Image uploaded successfully");
        this.getUploadedFiles();
      }, (err) => {
        console.log(err);
        loader.dismiss();
        this.presentToast(err);
      });
  }

  presentToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'bottom'
    });

    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });

    toast.present();
  }

}
