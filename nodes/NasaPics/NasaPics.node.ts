import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class NasaPics implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NASA Pics',
		name: 'nasaPics',
    icon: 'file:nasapics.svg',
		group: ['transform'],
		version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Get data from NASAs API',
		defaults: {
			name: 'Example Node',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
    credentials: [
      {
        name: 'nasaPicsApi',
        required: true,
      },
    ],
    requestDefaults: {
      baseURL: 'https://api.nasa.gov',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    },
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
        default: 'astronomyPictureOfTheDay',
        noDataExpression: true,
				options: [
          {
            name: 'Astronomy Picture of the Day',
            value: 'astronomyPictureOfTheDay',
          },
          {
            name: 'Mars Rover Photo',
            value: 'marsRoverPhotos',
          }
        ]
			},
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        default: 'get',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: [
              'astronomyPictureOfTheDay',
            ]
          }
        },
        options: [
          {
            name: 'Get',
            value: 'get',
            action: 'Get the APOD',
            description: 'Get the Astronomy Picture of the day',
            routing: {
              request: {
                method: 'GET',
                url: '/planetary/apod',
              }
            }
          }
        ]
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: [
              'marsRoverPhotos',
            ],
          },
        },
        options: [
          {
            name: 'Get',
            value: 'get',
            action: 'Get mars rover photo',
            description: 'Get photos from the Mars Rover',
            routing: {
              request: {
                method: 'GET',
              },
            },
          },
        ],
        default: 'get',
      },
      {
        displayName: 'Rover Name',
        description: 'Choose which Mars Rover to get a photo from',
        required: true,
        name: 'roverName',
        type: 'options',
        options: [
            {name: 'Curiosity', value: 'curiosity'},
            {name: 'Opportunity', value: 'opportunity'},
            {name: 'Perseverance', value: 'perseverance'},
            {name: 'Spirit', value: 'spirit'},
        ],
        routing: {
            request: {
                url: '=/mars-photos/api/v1/rovers/{{$value}}/photos',
            },
        },
        default: 'curiosity',
        displayOptions: {
            show: {
                resource: [
                    'marsRoverPhotos',
                ],
            },
        },
      },
      {
        displayName: 'Date',
        description: 'Earth date',
        required: true,
        name: 'marsRoverDate',
        type: 'dateTime',
        default:'',
        displayOptions: {
            show: {
                resource: [
                    'marsRoverPhotos',
                ],
            },
        },
        routing: {
            request: {
                // You've already set up the URL. qs appends the value of the field as a query string
                qs: {
                    earth_date: '={{ new Date($value).toISOString().substr(0,10) }}',
                },
            },
        },
      },
      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        default: {},
        placeholder: 'Add Field',
        displayOptions: {
            show: {
                resource: [
                    'astronomyPictureOfTheDay',
                ],
                operation: [
                    'get',
                ],
            },
        },
        options: [
            {
                displayName: 'Date',
                name: 'apodDate',
                type: 'dateTime',
                default: '',
                routing: {
                    request: {
                        // You've already set up the URL. qs appends the value of the field as a query string
                        qs: {
                            date: '={{ new Date($value).toISOString().substr(0,10) }}',
                        },
                    },
                },
            },
        ],	
      }
		],
    usableAsTool: true,
	};

	// The function below is responsible for actually doing whatever this node
	// is supposed to do. In this case, we're just appending the `myString` property
	// with whatever the user has entered.
	// You can make async calls and use `await`.
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		let item: INodeExecutionData;
		let myString: string;

		// Iterates over all input items and add the key "myString" with the
		// value the parameter "myString" resolves to.
		// (This could be a different value for each item in case it contains an expression)
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				myString = this.getNodeParameter('myString', itemIndex, '') as string;
				item = items[itemIndex];

				item.json.myString = myString;
			} catch (error) {
				// This node should never fail but we want to showcase how
				// to handle errors.
				if (this.continueOnFail()) {
					items.push({ json: this.getInputData(itemIndex)[0].json, error, pairedItem: itemIndex });
				} else {
					// Adding `itemIndex` allows other workflows to handle this error
					if (error.context) {
						// If the error thrown already contains the context property,
						// only append the itemIndex
						error.context.itemIndex = itemIndex;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex,
					});
				}
			}
		}

		return [items];
	}
}
