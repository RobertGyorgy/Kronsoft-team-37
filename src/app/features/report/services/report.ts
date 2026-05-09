import { Injectable, signal } from '@angular/core';

export interface ReportIssue {
  id: number;
  category: string;
  location: string;
  title: string;
  image: string;
  status: 'În lucru' | 'Rezolvat' | 'Sesizat';
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private initialReports: ReportIssue[] = [
    {
      id: 1,
      category: 'Infrastructură',
      location: 'Str. Republicii',
      title: 'Groapă în carosabil',
      image: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=800',
      status: 'În lucru'
    },
    {
      id: 2,
      category: 'Deșeuri',
      location: 'Parcul Titulescu',
      title: 'Coș de gunoi distrus',
      image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=800',
      status: 'Sesizat'
    },
    {
      id: 3,
      category: 'Iluminare',
      location: 'Piața Sfatului',
      title: 'Stâlp iluminat defect',
      image: 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?q=80&w=800',
      status: 'Rezolvat'
    }
  ];

  reports = signal<ReportIssue[]>(this.initialReports);

  addReport(report: Omit<ReportIssue, 'id' | 'status'>) {
    const newReport: ReportIssue = {
      ...report,
      id: Date.now(),
      status: 'Sesizat'
    };
    this.reports.update(current => [newReport, ...current]);
  }
}
