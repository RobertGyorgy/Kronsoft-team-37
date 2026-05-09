import { Injectable, signal } from '@angular/core';

export interface Report {
  id: number;
  title: string;
  location: string;
  description: string;
  category: string;
  image: string;
  status: 'Sesizat' | 'În lucru' | 'Rezolvat';
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  reports = signal<Report[]>([
    // INFRASTRUCTURĂ
    {
      id: 1,
      title: 'Groapă adâncă în carosabil',
      location: 'Strada Mureșenilor nr. 12',
      description: 'Groapă periculoasă apărută în urma înghețului, afectează siguranța traficului.',
      category: 'Infrastructură',
      image: '/reports/pothole.png',
      status: 'În lucru',
      date: '2024-05-08'
    },
    // DEȘEURI
    {
      id: 3,
      title: 'Punct de colectare supraîncărcat',
      location: 'Cartier Astra, Str. Uranus',
      description: 'Containerele de colectare selectivă sunt pline, gunoiul este depozitat pe lângă ele.',
      category: 'Deșeuri',
      image: '/reports/trash.png',
      status: 'În lucru',
      date: '2024-05-07'
    },
    // GRAFFITI
    {
      id: 5,
      title: 'Vandalism - Graffiti pe fațadă istorică',
      location: 'Strada Republicii, Centru Vechi',
      description: 'Mesaje de tip graffiti apărute peste noapte pe o clădire monument istoric.',
      category: 'Graffiti',
      image: '/reports/graffiti.png',
      status: 'Sesizat',
      date: '2024-05-09'
    },
    // CLĂDIRI
    {
      id: 7,
      title: 'Tencuială căzută de pe fațadă',
      location: 'Strada Postăvarului',
      description: 'Bucăți de tencuială s-au desprins și pun în pericol trecătorii.',
      category: 'Clădiri',
      image: '/reports/facade.png',
      status: 'În lucru',
      date: '2024-05-08'
    },
    // ILUMINARE
    {
      id: 9,
      title: 'Iluminat public defect (bec ars)',
      location: 'Parcul Nicolae Titulescu',
      description: 'Mai mulți stâlpi de iluminat nu funcționează în zona centrală a parcului.',
      category: 'Iluminare',
      image: '/reports/light.png',
      status: 'Rezolvat',
      date: '2024-05-06'
    },
    // SPAȚII VERZI
    {
      id: 11,
      title: 'Arbori uscați ce necesită toaletare',
      location: 'Bulevardul Gării',
      description: 'Ramuri uscate de mari dimensiuni stau să cadă peste mașinile parcate.',
      category: 'Spații verzi',
      image: '/reports/tree.png',
      status: 'În lucru',
      date: '2024-05-07'
    },
    // ALTELE
    {
      id: 13,
      title: 'Semn de circulație deteriorat',
      location: 'Intersecția Str. Lungă cu Str. de Mijloc',
      description: 'Semnul "Stop" este îndoit și nu mai este vizibil pentru șoferi.',
      category: 'Altele',
      image: '/reports/sign.png',
      status: 'În lucru',
      date: '2024-05-08'
    }
  ]);

  getReports() {
    return this.reports;
  }

  addReport(reportData: Omit<Report, 'id' | 'status' | 'date'>) {
    const newReport: Report = {
      ...reportData,
      id: Date.now(),
      status: 'Sesizat',
      date: new Date().toISOString().split('T')[0]
    };
    this.reports.update(current => [newReport, ...current]);
  }
}
