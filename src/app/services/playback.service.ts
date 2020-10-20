import { Injectable } from '@angular/core';
import { RemoteService } from './remote.service';

@Injectable({
  providedIn: 'root'
})
export class PlaybackService {
  constructor(private remoteService: RemoteService) {}
  audioTracks: any[];
  currentSong: any;
  async playSong(song){
    var self = this;

    //clear previous snippets
    await this.destroyAudioTracks();
    this.audioTracks = [];

    if (this.currentSong && song == this.currentSong){
      this.currentSong = null;
    }
    else{
      await self.appendAudioFile(song.localPath+"/song.ogg");
      await self.appendAudioFile(song.localPath+"/vocals.ogg");
      await self.appendAudioFile(song.localPath+"/rhythm.ogg");
      await self.appendAudioFile(song.localPath+"/guitar.ogg");
      await self.appendAudioFile(song.localPath+"/drums.ogg");
      await self.appendAudioFile(song.localPath+"/keys.ogg");
      await self.appendAudioFile(song.localPath+"/drums_1.ogg");
      await self.appendAudioFile(song.localPath+"/drums_2.ogg");
      await self.appendAudioFile(song.localPath+"/drums_3.ogg");
      await self.appendAudioFile(song.localPath+"/drums_4.ogg");
      await self.playAudioTracks();
      this.currentSong = song;
    }
  }

  async appendAudioFile(path: string){
    var self = this;
    if (this.remoteService.fs.existsSync(path)) {
      console.log('exists')
          var snd  = new Audio();
          var src  = document.createElement("source");
          src.type = "audio/mpeg";
          src.src  = path;
          snd.currentTime=2;
          snd.appendChild(src);
          self.audioTracks.push(snd);
          return true;
    } else {
      console.log('does not exist');
      return false;
    }
  }

  async playAudioTracks(){
    console.log(this.audioTracks);
    this.audioTracks.forEach((track) => {
      track.play();
    });
  }

  async destroyAudioTracks(){
    if(this.audioTracks){
      this.audioTracks.forEach((track) => {
        console.log(track);
        track.pause();
        while (track.firstChild) {
          track.removeChild(track.firstChild);
        }
        track.remove();
        track = null;
      });
      this.audioTracks = [];
    }
  }
}
