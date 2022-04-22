import { Component, Input, OnInit } from '@angular/core';
import { Mode } from 'src/app/enums/mode.enum'
import { ChemicalElement } from 'src/app/models/chemical-element.model'
import { ElementSelector } from 'src/app/services/element-selector.service'
import { ModeService } from 'src/app/services/mode.service'

@Component({
  selector: 'app-tooltip[type]',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.sass']
})
export class TooltipComponent implements OnInit {
  /**
   * Sets the type of the toolip component to match a given mode.
   * Can be set to 'elements', 'blocks', 'groups', or 'periods' so that the
   * title and description of the tooltip matches the respective modes.
   * Alternatively, setting it to 'auto' will automatically update the tooltip
   * to match the current mode.
   */
  @Input()
  type!: string

  constructor(
    private elementSelector: ElementSelector,
    private modeService: ModeService) { }

  ngOnInit(): void {
    this.setFunctions(this.type)
    this.elementSelector.subscribe(this, this.updateElement)
  }

  /** Represents the selected element to be shown in the tooltip. */
  element: ChemicalElement | null = null
  
  /**
   * Called by observable on selected element change.
   * */
  private updateElement = (value: any): void => { this.element = value as ChemicalElement | null; }

  /**
   * Called by observable on mode change.
   * */
  private updateMode = (value: any): void => {
    let mode: string = Mode[value].toString()
    if (!['Groups', 'Periods', 'Blocks'].includes(mode))
      mode = 'elements'
    this.setFunctions(mode)
  }

  /**
   * Returns the title of the tooltip.
   */
  public getTitle!: () => string

  /**
   * Returns the description of the tooltip.
   */
  public getDescription!: () => string

  /**
   * Returns the background text of the tooltip.
   */
  public getBackgroundText!: () => string

  /**
   * Determines whether or not the tooltip has information to show for the
   * selected element.
   * @returns True if the tooltip has information to show, false otherwise.
   */
  public hasData = (): boolean => {
    if (!this.element) return false

    // False in group mode, if the element group is null.
    if (this.modeService.getMode() === Mode.Groups &&
        !this.element.group)
        return false

    return true
  }

  /**
   * Sets the implementation of the function properties to match the given mode.
   * @param type The type of the toolip component to match a given mode.
   * Can be set to 'elements', 'blocks', 'groups', or 'periods' so that the
   * title and description of the tooltip matches the respective modes.
   * Alternatively, setting it to 'auto' will automatically update the tooltip
   * to match the current mode.
   */
  private setFunctions = (type: string) => {
    switch (type.toLowerCase()) {
      case 'auto':
        this.modeService.subscribe(this, this.updateMode)
        this.updateMode(this.modeService.getMode()) // initialize mode
        break
      case 'elements':
        this.getTitle = (): string => this.element!.name
        this.getDescription = (): string => this.element!.description
        this.getBackgroundText = (): string => this.element!.symbol
        break
      case 'groups':
        this.getTitle = (): string => {
          if (this.element!.group) {
            if (this.element?.group.trivialName) {
              return this.element.group.trivialName
            }
            return this.element!.group.name
          }
          return ''
        }
        this.getDescription = (): string => this.element!.group?.description ?? ''
        this.getBackgroundText = (): string => this.element!.group?.index.toString() ?? ''
        break
      case 'periods':
        this.getTitle = (): string => 'Period ' + this.element!.period.index.toString()
        this.getDescription = (): string => this.element!.period.description
        this.getBackgroundText = (): string => this.element!.period.index.toString()
        break
      case 'blocks':
        this.getTitle = (): string => this.element!.block.name
        this.getDescription = (): string => this.element!.block.description
        this.getBackgroundText = (): string => this.element!.block.name.substring(0, 1)
        break
      default:
        throw new Error('Invalid tooptip type input.' +
          'Must be: type="auto|elements|groups|periods|blocks".');
    }
  }
}