# RailsNestedAttributesCollection
*Handling nested attributes for rails `has_many` associations with collections*

This small library allows you to add/delete models from a collection without having to worry about
persisting those changes.

Normally if you deleted a model from the collection that was previously persisted, you'd need to somehow
track this deletion so you can tell Rails to delete the association server side.

Using this collection will automatically track these removals and provide the appropriate serialization to persist
their deletion on the server.
## Dependencies

  backbone.js > 0.9.0   *(for older versions, see git history)*

## Usage

### Defining your collection

    var SomeAssociatedCollection = Backbone.RailsNestedAttributesCollection({
      ... some other properties here, no different than normal
    });

### Instantiating your collection

This collection should be a property of the main model that they belong to:

For example:

    var SomeModel = Backbone.Model.extend({
      ...
      initialize: function(){
        this.associatedModels = new SomeAssociatedCollection( this.get('associated_models') )
      }
    });

Now when you add and delete from this collection, you don't need to worry tracking
the deleted models for persistence, this will happen automatically when you save

### Serializing your model

This isn't specific to this Collection, but the recommended way of persisting your associations would be something like:

    var SomeModel = Backbone.Model.extend({
      ...
      toJSON: function(){
        var attrs = _.clone(this.attributes);

        if (this.associatedModels.length){
          attrs['associated_models_attributes'] = this.associatedModels.toJSON();
          delete attrs['associated_models'] // in case they came in from initial serialization
        }
        return attrs;
      }
    });

### Enabling nested_attributes on your server

    class SomeModel < ActiveRecord::Base
      has_many :associated_models
      accepts_nested_attributes_for :associated_models, :allow_destroy => true
    end

    class AssociatedModel < ActiveRecord::Base
      belongs_to :some_model    # not required
    end
