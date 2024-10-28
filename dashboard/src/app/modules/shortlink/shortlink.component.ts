import { Component } from '@angular/core';
import { io } from 'socket.io-client';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DataService } from '../shared/services/dashboard.service';

const backend_URL = io('http://localhost:5000/');

@Component({
  selector: 'app-shortlink',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './shortlink.component.html',
  styleUrls: ['./shortlink.component.css'],
})
export class ShortlinkComponent {
  longUrl: string = '';
  shortUrl: string = '';
  isCopied: boolean = false;

  constructor(private dataService: DataService) { }

  generateShortLink() {
    this.dataService.generateShortLink(this.longUrl)
      .toPromise()
      .then(response => {
        const { statusCode } = response;

        if (statusCode === 201 || statusCode === 200) {
          this.shortUrl = `http://localhost:5000/shortUrl/${response.shortUrl}`;
        } else {
          this.longUrl = '';
          this.shortUrl = '';
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  copyShortUrl() {
    if (this.shortUrl) {
      navigator.clipboard.writeText(this.shortUrl).then(() => {
        this.isCopied = true;
        setTimeout(() => {
          this.isCopied = false;
        }, 10000);
      });
    }
  }
}
