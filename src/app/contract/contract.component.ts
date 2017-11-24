import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { PropertyService } from '../property/property.service';
import { ContractService } from './contract.service';
import { AuthService } from '../auth/auth.service';

@Component({
  moduleId: module.id,
  selector: 'app-contract',
  templateUrl: 'contract.component.html',
  styleUrls: []
})
export class ContractComponent implements OnInit {
  propertyService: PropertyService;
  contractService: ContractService;
  authService: AuthService;
  contractStep: number;
  imageTab: string;
  private sub: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    propertyService: PropertyService,
    contractService: ContractService,
    authService: AuthService
  ) {
    this.propertyService = propertyService;
    this.contractService = contractService;
    this.authService = authService;
  }

  ngOnInit() {
    this.contractStep = 1;
    this.imageTab = 'tab-image';
    this.contractService.importUserData();
    this.sub = this.route.params.subscribe(params => {
      let bippoId = this.propertyService.parsePropertyId(params['addr']);
      if (this.propertyService.getPropertyId() !== bippoId) {
        this.propertyService.getProperty(bippoId, () => {
          this.contractService.importPropertyData();
        }, (error:any, caught: Observable<any>) => {
          console.log(error);
          return caught;
        });
      } else {
        this.contractService.importPropertyData();
      }
    });
  }

  nextStep() {
    this.contractStep++;
  }

  roundDom(dom) {
    for (let i = 14; i < 365; i += 14) if (dom < i) return '< ' + i;
    return '> 365';
  }

  onSubmit() {
    // TODO
  }
}
