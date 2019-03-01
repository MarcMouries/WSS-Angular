import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule, 
  MatCheckboxModule, 
  MatFormFieldModule,
  MatInputModule,
  MatToolbarModule, 
  MatSidenavModule, 
  MatIconModule, 
  MatListModule, 
  MatGridListModule, 
  MatCardModule, 
  MatMenuModule, 
  MatTableModule, 
  MatPaginatorModule, 
  MatSortModule, 
  MatSelectModule,
  MatTabsModule,
  MatExpansionModule,
  MAT_LABEL_GLOBAL_OPTIONS,
  MatSnackBarModule,
  MatProgressSpinnerModule,
  MatDatepickerModule,
  MatNativeDateModule, 
  MatRadioModule,
  MatAutocompleteModule, 
  MatTooltipModule

 } from '@angular/material';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LayoutModule } from '@angular/cdk/layout';
import { WorklistComponent } from './worklist/worklist.component';
import { NavigationComponent } from './navigation/navigation.component';
import { MaintabsComponent } from './maintabs/maintabs.component';
import { WorklistpanelComponent } from './worklistpanel/worklistpanel.component';
import { WorkitemComponent } from './workitem/workitem.component';
import { LayoutComponent } from './_subcomponents/layout/layout.component';
import { GroupComponent } from './_subcomponents/group/group.component';
import { ViewComponent } from './_subcomponents/view/view.component';
import { PageComponent } from './_subcomponents/page/page.component';
import { FieldComponent } from './_subcomponents/field/field.component';
import { TopviewComponent } from './_subcomponents/topview/topview.component';
import { DropdownComponent } from './_fieldcomponents/dropdown/dropdown.component';
import { CaptionComponent } from './_subcomponents/caption/caption.component';
import { CreatecaselistComponent } from './_subcomponents/createcaselist/createcaselist.component';
import { LoginComponent } from './login/login.component';
import { TextinputComponent } from './_fieldcomponents/textinput/textinput.component';
import { TextareaComponent } from './_fieldcomponents/textarea/textarea.component';
import { CheckboxComponent } from './_fieldcomponents/checkbox/checkbox.component';
import { EmailComponent } from './_fieldcomponents/email/email.component';
import { UnitdaysComponent } from './_fieldcomponents/unitdays/unitdays.component';
import { AutocompleteComponent } from './_fieldcomponents/autocomplete/autocomplete.component';
import { CasedetailsComponent } from './casedetails/casedetails.component';
import { TextComponent } from './_fieldcomponents/text/text.component';
import { BreadcrumbComponent } from './_subcomponents/breadcrumb/breadcrumb.component';
import { DateComponent } from './_fieldcomponents/date/date.component';
import { ParagraphComponent } from './_subcomponents/paragraph/paragraph.component';
import { ButtonComponent } from './_fieldcomponents/button/button.component';
import { LinkComponent } from './_fieldcomponents/link/link.component';
import { IconComponent } from './_fieldcomponents/icon/icon.component';
import { RadioComponent } from './_fieldcomponents/radio/radio.component';
import { RepeatinggridComponent } from './_subcomponents/repeatinggrid/repeatinggrid.component';
import { RepeatinglayoutComponent } from './_subcomponents/repeatinglayout/repeatinglayout.component';
import { ToppageComponent } from './_subcomponents/toppage/toppage.component';
import { SafeHtmlPipe } from './_pipe/safehtml.pipe';
import { RecentlistComponent } from './_subcomponents/recentlist/recentlist.component';
import { NumberComponent } from './_fieldcomponents/number/number.component';
import { NosupportComponent } from './_fieldcomponents/nosupport/nosupport.component';



@NgModule({
  declarations: [
    AppComponent,
    WorklistComponent,
    NavigationComponent,
    MaintabsComponent,
    WorklistpanelComponent,
    WorkitemComponent,
    LayoutComponent,
    GroupComponent,
    ViewComponent,
    PageComponent,
    FieldComponent,
    TopviewComponent,
    DropdownComponent,
    CaptionComponent,
    CreatecaselistComponent,
    LoginComponent,
    TextinputComponent,
    TextareaComponent,
    CheckboxComponent,
    EmailComponent,
    UnitdaysComponent,
    AutocompleteComponent,
    CasedetailsComponent,
    TextComponent,
    BreadcrumbComponent,
    DateComponent,
    ParagraphComponent,
    ButtonComponent,
    LinkComponent,
    IconComponent,
    RadioComponent,
    RepeatinggridComponent,
    RepeatinglayoutComponent,
    ToppageComponent,
    SafeHtmlPipe,
    RecentlistComponent,
    NumberComponent,
    NosupportComponent
  ],

  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    LayoutModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatGridListModule,
    MatCardModule,
    MatMenuModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSelectModule,
    MatTabsModule,
    MatExpansionModule, 
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
    MatAutocompleteModule,
    MatTooltipModule,
  ],
  exports: [
    MatButtonModule,
    MatButtonModule
  ],
  providers: [{provide: MAT_LABEL_GLOBAL_OPTIONS, useValue: {float: 'auto'}}],
  bootstrap: [AppComponent]
})

export class AppModule { }
