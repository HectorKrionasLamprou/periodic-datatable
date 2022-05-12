import { Component, Input } from '@angular/core'
import { Classification } from 'src/app/enums/classification.enum'
import { Mode } from 'src/app/enums/mode.enum'
import { ElementSelector } from 'src/app/services/element-selector.service'
import { ModalService } from 'src/app/services/modal.service'
import { ModeService } from 'src/app/services/mode.service'
import { TemperatureService } from 'src/app/services/temperature.service'
import { ChemicalElement } from '../../models/chemical-element.model'
import { ChemicalElementService } from '../../services/chemical-element.service'
import { AtomicNumberError } from '../../models/error.model'
import { DatatableService } from 'src/app/services/datatable.service'

/**
 * Represents a single chemical element tile on the periodic table.
 */
@Component({
  selector: 'app-chemical-element[atomicNumber]',
  templateUrl: './chemical-element.component.html',
  styleUrls: ['./chemical-element.component.sass'],
})
export class ChemicalElementComponent{
  /** The atomic number or nuclear charge number (symbol Z) of a chemical element. */
  @Input()
  atomicNumber!: number

  constructor(
    private chemicalElementService: ChemicalElementService,
    private elementSelector: ElementSelector,
    private modeService: ModeService,
    private temperatureService: TemperatureService,
    private modalService: ModalService,
    private datatableService: DatatableService) {
  }
  ngOnInit() {
    this.element = this.chemicalElementService.getElement(this.atomicNumber)
    if (!this.element) {
      throw new AtomicNumberError(this.atomicNumber)
    }
  }

  /** Represents a chemical element that describes its chemical properties and its place in the periodic table. */
  public element!: ChemicalElement

  /**
   * Sets this element as selected.
   */
  public select = () => this.elementSelector.select(this.element.atomicNumber)

  /**
   * Replaces this element with null as the selected one.
   */
  public unselect = () => this.elementSelector.select(null)

  /**
   * Checks whether or not 'Blocks' is the current selected mode.
   * @returns True if the selected mode is 'Blocks', false otherwise.
   */
  public isInBlockMode = (): boolean => this.modeService.getMode() === Mode.Blocks

  /**
   * Gets the element tile html class, based on the current mode.
   * @returns A string of the html class name.
   */
  public getElementTileHtmlClass = (): string => {
    let htmlClass = ''

    const getElementsHtmlClass = (): string => ''

    const getBlocksHtmlClass = (): string => {
      let blocksClass: string = ''
      blocksClass += `${this.element.block.name}`
      if (this.elementSelector.selectedElement?.block === this.element.block) {
        blocksClass += ' highlighted'
      }
      return blocksClass
    }

    const getGroupsHtmlClass = (): string => {
      let groupsClass: string = ''
      if (this.element.group) {
        groupsClass += this.element.group.index % 2 === 0 ? ' stripe-even' : ' stripe-odd'
        if (this.elementSelector.selectedElement?.group === this.element.group) {
          groupsClass += ' highlighted'
        }
      }
      else {
        groupsClass += ' disabled'
      }
      return groupsClass
    }

    const getPeriodsHtmlClass = (): string => {
      let periodsClass: string = ''
      periodsClass += this.element.period.index % 2 === 0 ? ' stripe-even' : ' stripe-odd'
      if (this.elementSelector.selectedElement?.period === this.element.period) {
        periodsClass += ' highlighted'
      }
      return periodsClass
    }

    const getRadioactiveHtmlClass = (): string =>
      this.element.isRadioactive ? 'radioactive-true' : 'radioactive-false'

    const getStateHtmlClass = (): string => {
      const temperature = this.temperatureService.getTemperature()
      if (!this.element.meltingPoint || temperature < this.element.meltingPoint) {
        return 'state-solid'
      }
      if (!this.element.boilingPoint || temperature < this.element.boilingPoint) {
        return 'state-liquid'
      }
      return 'state-vapour'
    }

    const getClassificationHtmlClass = (): string =>
      'classification-' + Classification[this.element.classification].toString().toLowerCase()

    if (this.isDatatableOpen()) {
      htmlClass += 'minimal '
    }

    switch (this.modeService.getMode()) {
      case Mode.Elements: htmlClass += getElementsHtmlClass(); break
      case Mode.Blocks: htmlClass += getBlocksHtmlClass(); break
      case Mode.Groups: htmlClass += getGroupsHtmlClass(); break
      case Mode.Periods: htmlClass += getPeriodsHtmlClass(); break
      case Mode.Radioactive: htmlClass += getRadioactiveHtmlClass(); break
      case Mode.States: htmlClass += getStateHtmlClass(); break
      case Mode.Classification: htmlClass += getClassificationHtmlClass(); break
    }

    return htmlClass
  }

  /**
   * Opens the modal window.
   */
  public openModal = (): void => {
    this.modalService.open()
  }

  /**
   * Returns true if the datatable is currently open, false otherwise.
   */
  public isDatatableOpen = (): boolean =>
    this.datatableService.isVisible()
}