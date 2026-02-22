import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-folder-tree',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './folder-tree.component.html',
  styleUrls: ['./folder-tree.component.css'],
})
export class FolderTreeComponent {
  @Input() folders: any[] = [];
}
